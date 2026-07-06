# Lumen API — Design Doc (Go · chi)

**Language:** Go 1.24 · **Framework:** [chi](https://github.com/go-chi/chi) + stdlib `net/http` · **Why:** idiomatic modern Go — chi is 100% `net/http`-compatible (no framework lock-in), composable middleware, and pairs with Go 1.22+ method-pattern routing. JSON via `encoding/json/v2`-style struct tags; validation with `go-playground/validator`.

## Domain
Lumen is a portfolio/studio CMS: projects (case studies), services, an availability calendar, and inquiry intake for a single designer.

## Conventions
- Base `/api/v1`; JSON `camelCase`; UTC RFC 3339 timestamps.
- Public read endpoints are anonymous + aggressively cached; admin writes need a bearer token (single-tenant, PASETO).
- Errors: `{ "error": { "code": "not_found", "message": "..." } }` with matching HTTP status.
- Pagination unnecessary at this scale except inquiries (`?page=&perPage=`, `X-Total-Count`).

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/projects` | — | Case-study index (`?tag=identity&year=2024`) |
| GET | `/projects/{slug}` | — | Full case study (blocks: text/image/quote) |
| POST | `/projects` | admin | Create case study |
| PUT | `/projects/{slug}` | admin | Update (slug immutable; 409 on conflict) |
| DELETE | `/projects/{slug}` | admin | Soft-delete |
| GET | `/services` | — | The three service offerings |
| GET | `/availability` | — | Current booking window (`{ bookingFrom: "2026-Q4" }`) |
| POST | `/inquiries` | — | Contact-form intake (rate-limited, honeypot field) |
| GET | `/inquiries` | admin | Paginated inbox |
| PATCH | `/inquiries/{id}` | admin | Set status: `new → replied → archived` |
| GET | `/healthz` | — | Liveness |

## Representative types
```go
type Project struct {
    Slug     string   `json:"slug"`
    Title    string   `json:"title"`
    Tags     []string `json:"tags"`
    Year     int      `json:"year"`
    Summary  string   `json:"summary"`
    Blocks   []Block  `json:"blocks"`
    Featured bool     `json:"featured"`
}

type Inquiry struct {
    ID      string    `json:"id"`
    Name    string    `json:"name"    validate:"required,max=120"`
    Email   string    `json:"email"   validate:"required,email"`
    Budget  string    `json:"budget"  validate:"oneof=under-10k 10-25k 25k-plus undisclosed"`
    Message string    `json:"message" validate:"required,max=4000"`
    Status  string    `json:"status"` // new | replied | archived
    SentAt  time.Time `json:"sentAt"`
}
```

## Router wiring (illustrative)
```go
r := chi.NewRouter()
r.Use(middleware.RequestID, middleware.RealIP, middleware.Recoverer,
      middleware.Timeout(10*time.Second), httprate.LimitByIP(60, time.Minute))

r.Route("/api/v1", func(r chi.Router) {
    r.Get("/projects", h.ListProjects)         // Cache-Control: public, max-age=300
    r.Get("/projects/{slug}", h.GetProject)
    r.With(httprate.LimitByIP(5, time.Minute)).Post("/inquiries", h.CreateInquiry)

    r.Group(func(r chi.Router) {               // admin
        r.Use(auth.RequireToken)
        r.Post("/projects", h.CreateProject)
        r.Get("/inquiries", h.ListInquiries)
    })
})
```

## Non-functional
- **Storage:** SQLite (`modernc.org/sqlite`, pure Go) — right-sized for a single-tenant studio; content is also exportable as flat JSON for static builds.
- **Caching:** ETag + `Cache-Control` on all public GETs; CDN-friendly.
- **Spam defense:** IP rate limit (5/min on inquiries), hidden honeypot field → silent 202 discard.
- **Deploy:** single static binary, embedded migrations (`embed.FS`), graceful shutdown on SIGTERM.
- **Testing:** `httptest` table-driven tests per handler; `go vet` + `staticcheck` in CI.
