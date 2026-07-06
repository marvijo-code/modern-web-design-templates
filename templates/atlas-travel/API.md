# Atlas API — Design Doc (Python · FastAPI)

**Language:** Python 3.13 · **Framework:** [FastAPI](https://fastapi.tiangolo.com) + Pydantic v2 · **Why:** the modern Python standard for APIs — type-hint-driven validation, automatic OpenAPI/Swagger, async-first (httpx to suppliers), dependency injection for auth/db, uvicorn ASGI performance.

## Domain
Atlas sells small-group journeys: a catalog with departures (dated instances with limited seats), search/filtering, quotes, bookings, and traveller inquiries.

## Conventions
- Base `/api/v1`; `camelCase` JSON via Pydantic `alias_generator=to_camel`.
- Auth: public catalog/search anonymous; `POST /bookings` requires a customer session (OAuth2 password/social → JWT); ops endpoints require `staff` scope.
- Errors: FastAPI 422 validation shape for input; domain errors `{ "code": "sold_out", "message": "..." }`.
- Money: integer minor units + `currency` (`{"amount": 185000, "currency": "USD"}`).

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/journeys` | — | Search/filter: `?region=&maxPrice=&maxDays=&q=&sort=price` |
| GET | `/journeys/{slug}` | — | Full journey: itinerary days, inclusions, guide bio |
| GET | `/journeys/{slug}/departures` | — | Dated departures with `seatsLeft` |
| POST | `/quotes` | — | Price a party for a departure (rooms, extras) |
| POST | `/bookings` | customer | Book seats (idempotent via `Idempotency-Key`) |
| GET | `/bookings/{ref}` | customer | Booking status + documents |
| POST | `/bookings/{ref}/payments` | customer | Deposit / balance payment intent |
| DELETE | `/bookings/{ref}` | customer | Cancel per policy tier |
| POST | `/inquiries` | — | "Tell us your pace" intake (rate-limited) |
| GET | `/ops/departures?from=&to=` | staff | Load sheet: manifests, seat counts |
| PATCH | `/ops/departures/{id}` | staff | Adjust capacity / status |

## Representative models
```python
class Journey(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    slug: str
    name: str
    region: Literal["africa", "asia", "europe", "americas"]
    days: int = Field(ge=1, le=30)
    price_from: Money
    max_group: int = 12
    itinerary: list[ItineraryDay]

class BookingCreate(BaseModel):
    departure_id: UUID
    travellers: Annotated[list[Traveller], Len(min_length=1, max_length=12)]
    room_pref: Literal["twin", "double", "single"] = "twin"
```

## Route wiring (illustrative)
```python
router = APIRouter(prefix="/api/v1")

@router.get("/journeys", response_model=Page[JourneySummary])
async def search_journeys(
    filters: Annotated[JourneyFilters, Query()],
    repo: Annotated[JourneyRepo, Depends(get_repo)],
) -> Page[JourneySummary]:
    return await repo.search(filters)

@router.post("/bookings", status_code=201, response_model=Booking)
async def create_booking(
    payload: BookingCreate,
    user: Annotated[Customer, Depends(current_customer)],
    svc: Annotated[BookingService, Depends()],
    idem_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
):
    return await svc.book(payload, user, idem_key)  # raises SoldOut -> 409
```

## Booking flow & seat safety
`held(15 min) → confirmed → paid → travelled / cancelled`. Seat decrement happens in one `UPDATE … WHERE seats_left >= :n RETURNING` statement (Postgres) — no oversell; holds expire via a background task releasing seats.

## Non-functional
- **Storage:** PostgreSQL + SQLAlchemy 2 (async); Alembic migrations; search served by a materialized summary view.
- **Caching:** `Cache-Control` + Redis for catalog reads; search results 60 s.
- **Rate limiting:** slowapi per-IP on `/inquiries` and `/quotes`.
- **Async I/O:** payment provider + email via httpx/async tasks (arq worker).
- **Testing:** pytest + httpx `AsyncClient` against the app; property-based tests (hypothesis) on the quote calculator; OpenAPI schema snapshot in CI.
