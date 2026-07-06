---
name: api-design-scala
description: Design or extend the bloom-events API (Scala 3 + http4s + Tapir) idiomatically — endpoints as values, sealed error ADTs, cats-effect, oversell-proof ticket inventory. Use for any change to templates/bloom-events/API.md or new Scala API design work in this repo.
---

# API Design — Scala · http4s + Tapir (bloom-events)

Owns `templates/bloom-events/API.md`. Bloom is a conference (speakers/schedule, tiered ticket sales with hard inventory, QR check-in).

## Stack choices (fixed)
- **Tapir** endpoint descriptions as first-class values, interpreted into http4s routes AND the OpenAPI doc AND typed clients — one description, three artifacts. Never hand-write an http4s route that bypasses Tapir.
- cats-effect `IO`; doobie on PostgreSQL; circe semi-auto camelCase codecs; JWT with `attendee`/`staff`/`organizer` roles.
- Errors are a **sealed ADT** (`ApiError`) mapped via `oneOf` error outputs — exhaustive by construction; new failure = new case + new `oneOfVariant`.

## Conventions to preserve
- Inventory hot path: `UPDATE tiers SET sold = sold + :q WHERE id = :id AND sold + :q <= capacity` in the same transaction as order insert — the DB arbitrates, no oversell. Keep the 200-buys/150-capacity race test green.
- Pending orders expire via an fs2 stream (15 min TTL) releasing seats.
- QR ticket refs are HMAC-signed; check-in flips `admitted` atomically and answers `already_used` (with original scan time) on re-scan.
- Schedule stored as immutable revisions — publish = pointer swap, instant rollback. Don't mutate published revisions.
- Money minor units + `"ZAR"`; ISO-8601 with `Africa/Johannesburg` offset.

## When adding an endpoint
1. Describe it in Tapir first (input/output/security/`errorOut` variants); server logic is a pure `I => IO[Either[E, O]]` function.
2. Wire into the interpreter list AND the OpenAPI doc list (the snapshot test catches omissions).
3. Model with case classes + enums (Scala 3 `enum` for statuses); opaque types for ids (`TierId`).
4. Contention-shaped operations follow the conditional-UPDATE pattern; no application-level locks.
5. Update API.md endpoint table, model snippets, and the inventory section if invariants changed.
6. Testing story: munit-cats-effect on the pure server logic; doobie query checks; OpenAPI snapshot in CI.

## Idiom checklist
- No exceptions for domain flow — `Either[ApiError, A]` end to end.
- Caching: speakers/schedule/tiers behind ETag; `remaining` ≤30 s stale.
- otel4s tracing; per-IP token bucket on `/orders`.
