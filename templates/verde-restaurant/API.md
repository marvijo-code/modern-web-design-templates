# Verde API — Design Doc (PHP · Laravel)

**Language:** PHP 8.4 · **Framework:** [Laravel 12](https://laravel.com) · **Why:** the definitive modern PHP framework — expressive routing, Eloquent ORM, first-class validation (Form Requests), queues/notifications out of the box (perfect for reservation confirmations), Sanctum for token auth, Pest for testing.

## Domain
Verde is a restaurant: menus that change seasonally, table inventory, reservations with confirmation workflow, and opening hours.

## Conventions
- Base `/api/v1` (`routes/api.php`); JSON via Eloquent API Resources (`camelCase` through a resource layer).
- Public reads anonymous; staff endpoints behind Sanctum token with `staff` ability.
- Errors: Laravel validation errors `{ message, errors: { field: [...] } }` (422); domain errors as RFC-style `{ code, message }`.
- Dates: ISO-8601, restaurant-local timezone declared in payloads (`Africa/Johannesburg`).

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/menus` | — | Active menu grouped by category (small/fire/sweet/drinks) |
| GET | `/menus/archive` | — | Past seasonal menus |
| PUT | `/menus` | staff | Publish a new seasonal menu (atomic swap) |
| GET | `/hours` | — | Weekly hours + special closures |
| GET | `/availability?date=&party=` | — | Open time slots for a date/party size |
| POST | `/reservations` | — | Request a table (throttled) |
| GET | `/reservations/{code}` | — | Guest lookup by confirmation code |
| DELETE | `/reservations/{code}` | — | Guest cancellation (>24 h before) |
| GET | `/reservations?date=` | staff | Day sheet for service |
| PATCH | `/reservations/{id}` | staff | Confirm / seat / no-show |
| POST | `/waitlist` | — | Join waitlist for a full date |

## Representative validation (Form Request)
```php
class StoreReservationRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'   => ['required', 'string', 'max:120'],
            'email'  => ['required', 'email:rfc,dns'],
            'date'   => ['required', 'date', 'after_or_equal:today',
                         new OpenDay],            // rejects Mon/Tue + closures
            'time'   => ['required', 'date_format:H:i'],
            'party'  => ['required', 'integer', 'between:1,8'],
            'notes'  => ['nullable', 'string', 'max:500'],
        ];
    }
}
```

## Flow: reservation lifecycle
```
requested → confirmed → seated → completed
         ↘ declined            ↘ no_show
```
- `POST /reservations` checks slot inventory inside a DB transaction (`lockForUpdate` on the slot row) → status `requested`, returns a `code` (e.g. `VRD-8F3K`).
- A queued `ReservationRequested` notification emails the guest; staff confirm from the day sheet, firing `ReservationConfirmed` (mail + optional SMS via notification channels).
- Slots regenerate nightly from the hours table via a scheduled command (`schedule->daily()`).

## Route wiring (illustrative)
```php
Route::prefix('v1')->group(function () {
    Route::get('menus', [MenuController::class, 'current']);
    Route::get('availability', AvailabilityController::class);
    Route::post('reservations', [ReservationController::class, 'store'])
        ->middleware('throttle:5,1');           // 5/min per IP

    Route::middleware(['auth:sanctum', 'ability:staff'])->group(function () {
        Route::get('reservations', [ReservationController::class, 'daySheet']);
        Route::patch('reservations/{reservation}', [ReservationController::class, 'update']);
    });
});
```

## Non-functional
- **Storage:** MySQL 8; slots table pre-materialized per service; menu content versioned.
- **Queues:** database driver (Redis in prod) for all mail; retries with backoff.
- **Throttling:** `throttle:5,1` on reservation/waitlist; honeypot middleware on public POSTs.
- **Caching:** `Cache::remember` on menus/hours (invalidated on staff writes).
- **Testing:** Pest feature tests per endpoint (`RefreshDatabase`), mailable assertions, availability race-condition test with parallel requests.
