---
name: api-design-go
description: Design or extend the lumen-portfolio API (Go + chi) idiomatically — net/http-compatible handlers, table-driven httptest, single-binary deploys. Use for any change to templates/lumen-portfolio/API.md or new Go API design work in this repo.
---

# API Design — Go · chi (lumen-portfolio)

Owns `templates/lumen-portfolio/API.md`. Lumen is a single-tenant studio/portfolio CMS (case studies, services, availability, inquiry intake).

## Stack choices (fixed)
- **chi** router over stdlib `net/http` — handlers are plain `http.HandlerFunc`; no framework-specific context types.
- `encoding/json` with camelCase struct tags; `go-playground/validator` tags on input structs; PASETO admin token (single tenant — no user system).
- SQLite via `modernc.org/sqlite` (pure Go, single static binary, `embed.FS` migrations).

## Conventions to preserve
- Base `/api/v1`; public GETs anonymous with `Cache-Control` + ETag (CDN-friendly); admin writes grouped under `auth.RequireToken`.
- Errors: `{ "error": { "code", "message" } }` with matching status. Keep the small closed set of codes.
- Inquiry intake is rate-limited (`httprate.LimitByIP(5, time.Minute)`) with a honeypot field → silent 202 discard. Preserve both defenses on any public POST.
- Slugs are immutable identifiers; renames = 409.

## When adding an endpoint
1. Define the struct with json + validate tags; keep zero-value-safe fields.
2. Register in the `r.Route("/api/v1", …)` tree — public vs admin group placement is the auth decision.
3. Middleware order stays: RequestID → RealIP → Recoverer → Timeout → rate limits.
4. Decide cacheability; public content should also remain exportable as flat JSON for static builds.
5. Update API.md endpoint table + types; note pagination only if the collection can exceed ~100 rows (inquiries pattern: `?page=&perPage=` + `X-Total-Count`).
6. Testing story: table-driven `httptest` per handler; `staticcheck` clean.

## Idiom checklist
- Context deadlines respected (`middleware.Timeout` is 10 s).
- Graceful shutdown on SIGTERM; no goroutine leaks from handlers.
- Return concrete errors up, map to HTTP at the handler edge only.
