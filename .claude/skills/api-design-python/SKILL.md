---
name: api-design-python
description: Design or extend the atlas-travel API (Python + FastAPI) idiomatically — Pydantic v2 models, dependency injection, async seat-safe bookings. Use for any change to templates/atlas-travel/API.md or new Python API design work in this repo.
---

# API Design — Python · FastAPI (atlas-travel)

Owns `templates/atlas-travel/API.md`. Atlas sells small-group journeys (catalog → departures with limited seats → quotes → bookings → payments).

## Stack choices (fixed)
- **FastAPI** + **Pydantic v2** (`ConfigDict(alias_generator=to_camel, populate_by_name=True)` for camelCase), async SQLAlchemy 2 + Alembic, httpx for supplier/payment IO, arq for background work.
- Dependency injection (`Depends`) for repos/services/auth — handlers stay thin and testable.

## Conventions to preserve
- Base `/api/v1`; money as integer minor units + currency, never floats.
- Errors: FastAPI 422 shape for input; domain errors `{ "code", "message" }` (e.g. `sold_out` → 409).
- Booking flow `held(15 min) → confirmed → paid → travelled/cancelled`; seat decrement is one conditional `UPDATE … WHERE seats_left >= :n RETURNING` — no read-then-write. Holds expire via background task.
- `Idempotency-Key` on `POST /bookings`; rate limits (slowapi) on `/inquiries` and `/quotes`.
- Catalog reads cached (Redis + `Cache-Control`, 60 s for search).

## When adding an endpoint
1. Pydantic model first (constrained types: `Field(ge=…)`, `Literal`, `Annotated[list, Len(...)]`); response models declared on the route.
2. Query filters as a dependency model (`Annotated[Filters, Query()]`), not loose params.
3. Async all the way down — no blocking IO in handlers; offload slow work to arq and return 202 + status URL.
4. Auth tier explicit: anonymous catalog, customer JWT for money paths, `staff` scope for `/ops`.
5. Update API.md endpoint table + models; extend the booking-flow diagram if states changed.
6. Testing story: pytest + httpx `AsyncClient`; hypothesis property tests for pricing math; OpenAPI snapshot in CI.

## Idiom checklist
- `response_model`/`status_code` on every route (self-documenting OpenAPI).
- UUIDs for ids in paths; cursor pagination via a generic `Page[T]`.
- Timezone-aware datetimes only (`datetime` with tzinfo); reject naive.
