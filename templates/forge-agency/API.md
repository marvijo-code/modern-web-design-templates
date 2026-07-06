# FORGE API — Design Doc (Rust · Axum)

**Language:** Rust 1.85 (edition 2024) · **Framework:** [Axum](https://github.com/tokio-rs/axum) on Tokio · **Why:** the modern Rust standard — tower middleware ecosystem, type-safe extractors, `serde` (de)serialization, compile-time-checked SQL via `sqlx`. Errors modeled with `thiserror` + a single `IntoResponse` impl.

## Domain
FORGE's site backend: a project (case-study) index, service catalog, brief/lead intake with qualification, and a small careers board.

## Conventions
- Base `/api/v1`; `camelCase` JSON (`#[serde(rename_all = "camelCase")]`).
- Public reads anonymous, heavily cached; studio endpoints behind a bearer token checked by middleware (`tower_http::validate_request`).
- Errors: `{ "code": "brief_too_small", "message": "..." }` with correct status; every response carries `x-request-id` (tower-http `RequestId`).

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/projects` | — | Case-study index (`?discipline=identity&year=`) |
| GET | `/projects/{slug}` | — | Full case study |
| GET | `/services` | — | The four disciplines |
| POST | `/briefs` | — | New-business intake (rate-limited, validated) |
| GET | `/briefs` | studio | Qualified lead inbox (`?status=new`) |
| PATCH | `/briefs/{id}` | studio | Move through pipeline |
| GET | `/jobs` | — | Open roles |
| POST | `/jobs/{id}/applications` | — | Apply (multipart: CV ≤ 5 MB PDF) |
| GET | `/healthz` | — | Liveness (build SHA + uptime) |

## Representative types
```rust
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Brief {
    pub id: Uuid,
    pub company: String,
    pub contact_email: String,
    pub disciplines: Vec<Discipline>,   // strategy | identity | campaigns | motion
    pub budget_band: BudgetBand,        // Under50k rejected at validation with code "brief_too_small"
    pub summary: String,                // 40..=4000 chars
    pub status: BriefStatus,            // new -> reviewing -> call_booked -> won | passed
    pub received_at: DateTime<Utc>,
}
```

## Router wiring (illustrative)
```rust
let app = Router::new()
    .route("/api/v1/projects", get(list_projects))
    .route("/api/v1/projects/{slug}", get(get_project))
    .route("/api/v1/briefs", post(create_brief).get(list_briefs.layer(require_studio())))
    .layer(
        ServiceBuilder::new()
            .layer(TraceLayer::new_for_http())
            .layer(SetRequestIdLayer::x_request_id(MakeRequestUuid))
            .layer(GovernorLayer::new(per_ip(5, Duration::from_secs(60)))) // briefs
            .layer(CompressionLayer::new()),
    )
    .with_state(AppState { db, mailer });
```

Handlers return `Result<Json<T>, ApiError>`; `ApiError` implements `IntoResponse`, mapping domain variants to statuses — no stringly-typed errors:

```rust
pub enum ApiError {
    #[error("brief budget below minimum")] BriefTooSmall,   // 422
    #[error("not found")] NotFound,                          // 404
    #[error(transparent)] Db(#[from] sqlx::Error),           // 500 (logged, opaque body)
}
```

## Non-functional
- **Storage:** PostgreSQL via `sqlx` (compile-time checked queries, migrations in `./migrations`).
- **Validation:** `garde` derive on all input DTOs; multipart CV size/type enforced before buffering.
- **Static export:** `GET /projects` content is also emitted as JSON at build time so the brutalist front-end can be hosted fully static; the API is the source of truth.
- **Observability:** `tracing` + OpenTelemetry exporter; JSON logs; `/healthz` exposes git SHA.
- **Testing:** handler tests with `tower::ServiceExt::oneshot` (no socket); `sqlx::test` per-test DB; deny-warnings CI with `clippy --all-targets -- -D warnings`.
