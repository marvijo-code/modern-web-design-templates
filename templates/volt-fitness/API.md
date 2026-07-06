# VOLT API — Design Doc (Kotlin · Ktor)

**Language:** Kotlin 2.1 · **Framework:** [Ktor 3](https://ktor.io) (server) · **Why:** the modern Kotlin-native choice — coroutine-first, lightweight DSL routing, `kotlinx.serialization` for zero-reflection JSON, typed config, and it stays idiomatic Kotlin instead of Java-with-annotations. Exposed (JetBrains) for SQL.

## Domain
VOLT is a gym: memberships with tiered access, a weekly class timetable with capacity-limited bookings, check-ins (24/7 door access), and coach rosters.

## Conventions
- Base `/api/v1`; `camelCase` JSON via `kotlinx.serialization`; times in ISO-8601 with `Africa/Johannesburg` zone context.
- Auth: JWT (Ktor `Authentication` plugin) — `member` and `staff` roles; door controller uses a scoped machine token.
- Errors: `{ "code": "class_full", "message": "..." }` via `StatusPages` plugin mapping typed exceptions.

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/classes?day=mon` | — | Public timetable (drives the site schedule) |
| GET | `/classes/{id}` | — | Class detail incl. `spotsLeft` |
| POST | `/classes/{id}/bookings` | member | Book a spot (tier-gated, capacity-checked) |
| DELETE | `/bookings/{id}` | member | Cancel ≥2 h before start |
| GET | `/me/bookings?from=` | member | My upcoming classes |
| GET | `/plans` | — | Membership tiers + pricing |
| POST | `/memberships` | — | Join (creates member + payment mandate) |
| PATCH | `/memberships/{id}` | member | Upgrade / freeze / cancel |
| POST | `/checkins` | door | Access-control event (`{ memberId, doorId }`) → allow/deny |
| GET | `/staff/roster?week=` | staff | Coach roster |
| GET | `/staff/attendance?classId=` | staff | Class list with booked/attended |

## Representative models
```kotlin
@Serializable
data class GymClass(
    val id: String,
    val name: String,
    val day: DayOfWeek,
    val startsAt: String,          // "17:30"
    val durationMin: Int,
    val coach: String,
    val level: Level,              // OPEN, ALL_LEVELS, INTERMEDIATE, ADVANCED
    val intensity: Intensity,      // NORMAL, HARD
    val capacity: Int,
    val spotsLeft: Int,
)

@Serializable
data class BookingRequest(val classOccurrenceDate: LocalDate)

sealed class DomainException(val code: String, val status: HttpStatusCode) :
    RuntimeException() {
    class ClassFull : DomainException("class_full", HttpStatusCode.Conflict)
    class TierNotAllowed : DomainException("tier_not_allowed", HttpStatusCode.Forbidden)
    class TooLateToCancel : DomainException("too_late_to_cancel", HttpStatusCode.UnprocessableEntity)
}
```

## Routing DSL (illustrative)
```kotlin
fun Route.classRoutes(svc: ClassService) = route("/api/v1") {
    get("/classes") {
        val day = call.request.queryParameters["day"]?.let(DayOfWeek::parse)
        call.respond(svc.timetable(day))
    }
    authenticate("member-jwt") {
        post("/classes/{id}/bookings") {
            val member = call.principal<MemberPrincipal>()!!
            val req = call.receive<BookingRequest>()
            call.respond(HttpStatusCode.Created,
                svc.book(call.parameters["id"]!!, req.classOccurrenceDate, member))
        }
    }
}
```

## Capacity & check-in rules
- Booking decrements `spots_left` with a conditional SQL update (`WHERE spots_left > 0`) inside a transaction — a full class raises `ClassFull` (409); no oversell under concurrency.
- Check-in decision = membership active ∧ tier window (off-peak ⇒ 09:00–16:00) ∧ no freeze; decisions logged for the access audit trail; endpoint answers in <50 ms (door hardware requirement) from an in-memory membership cache refreshed via DB change polling.

## Non-functional
- **Storage:** PostgreSQL + Exposed DSL; timetable is a template (weekly classes) + generated occurrences.
- **Payments:** debit-order provider webhooks → `POST /webhooks/payments` (HMAC verified) toggling membership state.
- **Rate limiting:** Ktor `RateLimit` plugin on join/booking routes.
- **Observability:** `CallLogging` + Micrometer → Prometheus; structured JSON logs.
- **Testing:** `testApplication { }` in-process route tests (no socket), Testcontainers Postgres, a concurrency test hammering one class with 50 parallel bookings asserting exactly `capacity` succeed.
