# Bloom API — Design Doc (Scala · http4s + Tapir)

**Language:** Scala 3.6 · **Framework:** [http4s](https://http4s.org) (cats-effect) with [Tapir](https://tapir.softwaremill.com) endpoint descriptions · **Why:** the best-in-class typed-functional Scala stack — endpoints are *values* described once in Tapir and interpreted into an http4s server, an OpenAPI spec, and a type-safe client; cats-effect gives principled concurrency for the ticket-inventory hot path; circe for JSON.

## Domain
Bloom is a conference: speakers and talks, a two-day schedule, tiered ticket sales with hard inventory, and attendee check-in.

## Conventions
- Base `/api/v1`; `camelCase` circe JSON (semi-auto derivation); money minor units + `"ZAR"`; times ISO-8601 with `Africa/Johannesburg` offset.
- Public content anonymous + cached; purchase requires an attendee session; organizer endpoints need `organizer` role (JWT).
- Errors are a sealed ADT rendered as `{ "code": "tier_sold_out", "message": "..." }` — exhaustive by construction.

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/speakers` | — | Speaker grid data |
| GET | `/schedule?day=1` | — | Agenda slots for a day |
| GET | `/tiers` | — | Ticket tiers with live `remaining` |
| POST | `/orders` | attendee | Buy tickets (`{tierId, quantity, attendees[]}`) |
| GET | `/orders/{ref}` | attendee | Order + QR ticket codes |
| POST | `/orders/{ref}/cancel` | attendee | Cancel per policy (>14 days out) |
| POST | `/checkin` | staff | Scan a ticket QR → `admitted | already_used | invalid` |
| GET | `/organizer/sales` | organizer | Tier totals, revenue, daily curve |
| PUT | `/organizer/schedule` | organizer | Publish schedule revision (atomic swap) |

## Tapir endpoint description (illustrative)
```scala
val buyTickets: Endpoint[AuthToken, CreateOrder, ApiError, Order, Any] =
  endpoint.post
    .in("api" / "v1" / "orders")
    .securityIn(auth.bearer[AuthToken]())
    .in(jsonBody[CreateOrder])
    .out(statusCode(StatusCode.Created).and(jsonBody[Order]))
    .errorOut(
      oneOf[ApiError](
        oneOfVariant(statusCode(StatusCode.Conflict).and(jsonBody[TierSoldOut])),
        oneOfVariant(statusCode(StatusCode.UnprocessableEntity).and(jsonBody[ValidationFailed])),
      )
    )

// One description, three artifacts:
val routes  = Http4sServerInterpreter[IO]().toRoutes(buyTickets.serverLogic(orderService.buy))
val openApi = OpenAPIDocsInterpreter().toOpenAPI(List(buyTickets), "Bloom API", "1.0")
```

## Domain model
```scala
final case class Tier(
    id: TierId,
    name: String,                       // early-bird | regular | studio-bundle
    priceMinor: Long,
    seatsPerOrder: Int,                 // studio bundle = 5
    capacity: Int,
    sold: Int,
):
  def remaining: Int = capacity - sold

enum OrderStatus:
  case PendingPayment, Paid, Cancelled, Refunded

sealed trait ApiError derives Codec.AsObject
final case class TierSoldOut(code: "tier_sold_out", remaining: Int) extends ApiError
```

## Inventory hot path
Ticket purchase is the contended operation (early-bird sells out in a weekend):
- `sold` increments via a single conditional `UPDATE tiers SET sold = sold + :q WHERE id = :id AND sold + :q <= capacity` (doobie), inside a transaction that also inserts the order — the DB is the arbiter, no oversell.
- Payment intent created after reservation; an fs2 stream of expired `PendingPayment` orders (15 min TTL) releases seats.
- QR codes are signed (HMAC) ticket refs; `/checkin` verifies signature then flips `admitted` atomically — a re-scan returns `already_used` with the original scan time.

## Non-functional
- **Storage:** PostgreSQL + doobie; schedule stored as immutable revisions (publish = pointer swap, instant rollback).
- **Caching:** speakers/schedule/tiers behind `Cache-Control` + ETag; tier `remaining` capped at 30 s staleness.
- **Rate limiting:** per-IP token bucket middleware on `/orders`.
- **Observability:** otel4s tracing; http4s middleware logs structured JSON.
- **Testing:** endpoint logic tested as pure functions (Tapir server logic is `I => IO[Either[E, O]]`); munit-cats-effect; a race test issuing 200 concurrent buys against a 150-capacity tier asserting exactly 150 succeed; OpenAPI snapshot check in CI.
