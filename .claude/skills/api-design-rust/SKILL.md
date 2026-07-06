---
name: api-design-rust
description: Design or extend the forge-agency API (Rust + Axum) idiomatically — typed extractors, thiserror ApiError → IntoResponse, tower middleware, sqlx. Use for any change to templates/forge-agency/API.md or new Rust API design work in this repo.
---

# API Design — Rust · Axum (forge-agency)

Owns `templates/forge-agency/API.md`. FORGE is a creative agency (case-study index, brief/lead intake with qualification, careers).

## Stack choices (fixed)
- **Axum** on Tokio with tower/tower-http middleware; `serde` with `#[serde(rename_all = "camelCase")]`; **sqlx** Postgres with compile-time-checked queries; `garde` for input validation; `tracing` + OpenTelemetry.
- Errors: one `ApiError` enum (`thiserror`) implementing `IntoResponse` — every domain failure is a variant with a fixed status; DB errors wrap transparently and render opaque 500s. No stringly-typed errors, no `unwrap` in handlers.

## Conventions to preserve
- Base `/api/v1`; public reads anonymous + cached; studio endpoints behind bearer validation middleware.
- Brief intake: budget bands below minimum are rejected at validation with code `brief_too_small` (422); pipeline `new → reviewing → call_booked → won|passed`.
- Middleware stack order: Trace → RequestId → rate limit (Governor, per-IP on intake) → Compression. Every response carries `x-request-id`.
- Multipart uploads (CVs) enforce size/type limits **before** buffering.
- Public project content is also emitted as static JSON at build time — the API stays the source of truth.

## When adding an endpoint
1. DTOs as structs with serde + garde derives; enums for closed sets (disciplines, statuses).
2. Handler signature: extractors in, `Result<Json<T>, ApiError>` out; new failure modes = new `ApiError` variants (compiler forces exhaustive mapping).
3. State via `State<AppState>`; no globals.
4. New queries through `sqlx::query_as!` so CI type-checks them; migrations in `./migrations`.
5. Update API.md endpoint table, types, and the error enum listing.
6. Testing story: `tower::ServiceExt::oneshot` handler tests; `sqlx::test` per-test database; clippy `-D warnings` stays clean.

## Idiom checklist
- Path params via `Path<T>`, never manual parsing; query via `Query<T>` with `#[serde(default)]`.
- 201 + Location on create; 202 for queued work.
- Long-running work spawns onto Tokio with cancellation safety — handlers never block.
