---
name: api-design-csharp
description: Design or extend the pulse-dashboard API (C# / ASP.NET Core Minimal APIs) idiomatically — typed results, ProblemDetails, output caching, ingestion queues. Use for any change to templates/pulse-dashboard/API.md or new C# API design work in this repo.
---

# API Design — C# · ASP.NET Core Minimal APIs (pulse-dashboard)

Owns `templates/pulse-dashboard/API.md`. Pulse is a product-analytics + service-health platform (event ingestion → rollups → dashboard reads).

## Stack choices (fixed)
- .NET 9 **Minimal APIs** (not MVC controllers): `MapGroup`, `TypedResults`, `Results<Ok<T>, NotFound>` union return types.
- Source-generated JSON (`JsonSerializerContext`), camelCase. Records for DTOs, enums for closed sets (`ServiceStatus`).
- Built-in `AddProblemDetails()`, `AddRateLimiter`, `AddOutputCache`, JWT bearer auth with `read` / `ingest` policies.

## Conventions to preserve
- Base `/api/v1`; time windows via `?window=7d|30d|90d` or `?from=&to=` ISO-8601 UTC.
- Ingestion is **202 Accepted** into a Channel → background `IHostedService` writer; at-least-once with client `eventId` dedup. Never make ingest synchronous.
- Dashboard reads hit pre-bucketed rollups (minute→hour→day), never raw event scans; KPI/series endpoints carry 30 s `OutputCache`.
- Keyset pagination (`?after=&limit=`), ETag on exports.

## When adding an endpoint
1. Model the DTO as a record in the shared types section; add it to the `JsonSerializerContext`.
2. Map under the right group (`/metrics` read-authorized, `/ingest` ingest-authorized) with `WithName` for OpenAPI.
3. Return `TypedResults.*`; validation failures surface as `ProblemDetails` (400/422), not exceptions.
4. Decide caching + rate limiting explicitly (metrics = cache, ingest = per-key token bucket).
5. Update API.md's endpoint table and representative types.
6. Testing story: `WebApplicationFactory` integration test per endpoint; keep `TreatWarningsAsErrors`.

## Idiom checklist
- `CancellationToken` threaded through every async call.
- Health endpoints (`/healthz`, `/readyz`) stay anonymous.
- Prefer OpenTelemetry instrumentation over hand-rolled logging middleware.
