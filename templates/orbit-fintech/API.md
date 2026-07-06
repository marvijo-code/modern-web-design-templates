# Orbit API — Design Doc (Swift · Vapor)

**Language:** Swift 6 (strict concurrency) · **Framework:** [Vapor 4](https://vapor.codes) on SwiftNIO · **Why:** the best-in-class server-side Swift framework — async/await-native routing, `Codable` models shared verbatim with the iOS app (one source of truth for DTOs), Fluent ORM, and compile-time safety that suits money code.

## Domain
Orbit is a multi-currency account: balances per currency, FX quotes/conversions at mid-market, transfers (instant internal, rails-based external), cards with controls, and rate alerts.

## Conventions
- Base `/api/v1`; `camelCase` JSON via `Codable`; **all money as integer minor units** + ISO-4217 currency — never floats.
- Auth: OAuth2 + passkeys; access JWT (5 min) + refresh; sensitive actions (external transfer, card unfreeze) require a step-up `confirmationToken`.
- Errors: `{ "code": "insufficient_funds", "reason": "..." }` via a custom `AbortError` conformance.
- Idempotency: `Idempotency-Key` required on all money-moving POSTs (409 on key reuse with different payload).

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/accounts` | Balances per currency (`[{currency, availableMinor, reservedMinor}]`) |
| GET | `/rates?base=USD` | Mid-market rates (public, cached 5 s) |
| POST | `/quotes` | Lock a conversion quote (`{from, to, amountMinor}` → rate + 30 s expiry) |
| POST | `/conversions` | Execute a quote (`{quoteId}`) atomically across both balances |
| POST | `/transfers` | Send money (internal = instant; external = rails + status webhooks) |
| GET | `/transfers/{id}` | Status timeline (`created → screening → sent → settled`) |
| GET | `/transactions?currency=&cursor=` | Unified ledger, cursor-paginated |
| GET | `/cards` / POST `/cards` | List / issue (virtual instant, physical shipped) |
| PATCH | `/cards/{id}` | Freeze / limits / per-merchant blocks |
| POST | `/alerts` | Rate alert (`{pair, targetRate, autoConvertAmountMinor?}`) |
| GET | `/statements/{yyyy-mm}.pdf` | Monthly statement |

## Representative DTOs (shared with the iOS client)
```swift
struct Money: Content, Equatable {
    let amountMinor: Int64
    let currency: Currency          // ISO-4217 enum
}

struct Quote: Content {
    let id: UUID
    let from: Currency
    let to: Currency
    let rate: Decimal               // mid-market, no spread
    let sendMoney: Money
    let receiveMoney: Money
    let expiresAt: Date             // +30 s
}

struct CreateTransfer: Content, Validatable {
    let destination: TransferDestination   // .orbitTag(String) | .iban(String) | ...
    let money: Money
    let reference: String?
    static func validations(_ v: inout Validations) {
        v.add("reference", as: String?.self, is: .nil || .count(...140))
    }
}
```

## Route wiring (illustrative)
```swift
func routes(_ app: Application) throws {
    let api = app.grouped("api", "v1")
    api.get("rates") { req async throws -> RatesResponse in
        try await req.application.rateCache.current(base: req.query["base"] ?? "USD")
    }

    let secured = api.grouped(UserAuthenticator(), User.guardMiddleware())
    secured.grouped(IdempotencyMiddleware())
        .post("conversions") { req async throws -> Conversion in
            let cmd = try req.content.decode(ExecuteQuote.self)
            return try await req.services.fx.execute(cmd, for: req.auth.require(User.self))
        }
}
```

## Money-safety rules
- Conversions are double-entry: one DB transaction inserts matching debit/credit ledger rows and updates both balances with conditional `WHERE available_minor >= amount` — `insufficientFunds` on failure, no partial state.
- Quotes pin the rate; execution after `expiresAt` returns `quote_expired` (410) — the client re-quotes, the user never gets a silently different rate.
- Ledger is append-only; balances are derived and periodically reconciled by a background job that alerts on drift.

## Non-functional
- **Storage:** PostgreSQL via Fluent; ledger table partitioned monthly.
- **Rates:** provider websocket → in-memory `RateCache` actor (Swift concurrency), snapshot every 5 s; alert engine evaluates on each tick.
- **Screening:** external transfers pass sanctions/anomaly screening before `sent`.
- **Observability:** structured Logging + Metrics (SwiftPrometheus); trace IDs on every response.
- **Testing:** `XCTVapor` route tests; property-based tests on conversion rounding (bankers') asserting debit+credit always balance to zero.
