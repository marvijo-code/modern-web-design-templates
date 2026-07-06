---
name: api-design-kotlin
description: Design or extend the volt-fitness API (Kotlin + Ktor) idiomatically — routing DSL, kotlinx.serialization, sealed domain exceptions, capacity-safe bookings. Use for any change to templates/volt-fitness/API.md or new Kotlin API design work in this repo.
---

# API Design — Kotlin · Ktor (volt-fitness)

Owns `templates/volt-fitness/API.md`. VOLT is a gym (timetable, tier-gated capacity-limited class bookings, memberships, door check-ins).

## Stack choices (fixed)
- **Ktor 3** server with the routing DSL; `kotlinx.serialization` (`@Serializable` data classes, zero reflection); Exposed on PostgreSQL; JWT auth plugin (`member`/`staff` roles + a scoped `door` machine token); `StatusPages` for errors.
- Domain failures are a **sealed `DomainException` hierarchy** carrying `code` + `HttpStatusCode`; `StatusPages` maps them — handlers never build error responses by hand.

## Conventions to preserve
- Capacity safety: booking decrements `spots_left` with a conditional SQL `UPDATE … WHERE spots_left > 0` in a transaction; full class = `ClassFull` (409). Keep this pattern for anything capacity-shaped.
- Tier gating: off-peak members only book 09:00–16:00 classes (`TierNotAllowed` 403); cancellations ≥2 h before start (`TooLateToCancel` 422).
- Door check-in must answer <50 ms from the in-memory membership cache — never put DB round-trips or new sync work on that path.
- Timetable = weekly template + generated occurrences; ISO-8601 times with `Africa/Johannesburg` context.
- Payment provider webhooks HMAC-verified before touching membership state.

## When adding an endpoint
1. `@Serializable` request/response data classes; enums for closed sets (Level, Intensity).
2. Place in the routing tree under the right `authenticate("member-jwt" | "staff-jwt")` block; public timetable stays anonymous.
3. New failure modes = new sealed subclasses (exhaustive `when` keeps mapping honest).
4. Suspend functions all the way; Exposed calls wrapped in `newSuspendedTransaction`.
5. Update API.md endpoint table, models, and the rules section if policy changed.
6. Testing story: `testApplication { }` route tests, Testcontainers Postgres, and keep the 50-parallel-bookings race test green for capacity changes.

## Idiom checklist
- `call.receive<T>()` + validation before any side effect; 201 on create.
- Rate limits via the Ktor `RateLimit` plugin on join/booking routes.
- Micrometer metrics + structured JSON logs via `CallLogging`.
