---
name: api-design-php
description: Design or extend the verde-restaurant API (PHP + Laravel) idiomatically — Form Requests, Eloquent resources, queued notifications, reservation lifecycle. Use for any change to templates/verde-restaurant/API.md or new PHP API design work in this repo.
---

# API Design — PHP · Laravel (verde-restaurant)

Owns `templates/verde-restaurant/API.md`. Verde is a restaurant (seasonal menus, slot inventory, reservations with confirmation workflow, hours).

## Stack choices (fixed)
- **Laravel 12**, `routes/api.php`, Eloquent + API Resources for camelCase output, Sanctum tokens with a `staff` ability, Pest tests.
- Validation lives in **Form Request** classes (custom rules like `OpenDay` for closed weekdays) — never inline `$request->validate` for non-trivial input.
- All mail/notifications are **queued** (`ShouldQueue`) — reservation flows must never block the request on SMTP.

## Conventions to preserve
- Base `/api/v1`; public reads cached via `Cache::remember`, invalidated on staff writes.
- Reservation lifecycle: `requested → confirmed → seated → completed`, branches `declined` / `no_show`. Guests act via confirmation `code` (e.g. `VRD-8F3K`), staff via id.
- Slot inventory checked inside a DB transaction with `lockForUpdate` — keep the race-safety on any capacity-touching change.
- Public POSTs: `throttle:5,1` + honeypot middleware.
- Menus swap atomically as versioned documents; slots regenerate nightly from hours via the scheduler.

## When adding an endpoint
1. Route in the right group (public vs `auth:sanctum` + `ability:staff`); resourceful controllers where the verbs fit.
2. New input → a Form Request; new output → an API Resource (no raw model serialization).
3. State transitions belong on the model/domain layer with explicit allowed-transition checks (409 on invalid).
4. Side effects → events + queued listeners/notifications.
5. Update API.md endpoint table, lifecycle diagram if states changed, and validation snippet if rules changed.
6. Testing story: Pest feature tests with `RefreshDatabase`; mailable assertions; a parallel-request race test for capacity paths.

## Idiom checklist
- Timezone declared (`Africa/Johannesburg`) in payloads; store UTC.
- 422 with Laravel's `errors` map for validation; domain errors `{ code, message }`.
- `php artisan schedule` for time-based jobs — no external cron logic in handlers.
