# Pulse API — Design Doc (C# · ASP.NET Core Minimal APIs)

**Language:** C# 13 / .NET 9 · **Framework:** ASP.NET Core **Minimal APIs** · **Why:** the modern idiomatic .NET choice — source-generated JSON, native OpenAPI (`Microsoft.AspNetCore.OpenApi`), typed results (`Results<Ok<T>, NotFound>`), best-in-class perf on TechEmpower, first-party auth/rate-limiting middleware.

## Domain
Pulse is a product analytics + service-health platform: it ingests events, aggregates sessions/revenue/conversions, and tracks per-service operational metrics.

## Conventions
- Base `/api/v1`; `camelCase` JSON (source-generated `JsonSerializerContext`).
- Auth: JWT bearer (`AddAuthentication().AddJwtBearer()`); write scopes for ingestion keys, read scopes for dashboards.
- Errors: `ProblemDetails` everywhere (`AddProblemDetails()`).
- Pagination: keyset — `?after=<id>&limit=`; responses `{ items, after }`.
- Time windows: `?window=7d|30d|90d` or explicit `?from=&to=` (ISO-8601, UTC).

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/ingest/events` | Batch event ingestion (NDJSON or JSON array, ≤5 MB) |
| GET | `/metrics/kpis?window=` | Sessions, revenue, conversion, active users + deltas |
| GET | `/metrics/timeseries?metric=sessions&window=&bucket=day` | Bucketed series for charts |
| GET | `/metrics/sources?window=` | Traffic-source share (donut) |
| GET | `/services` | Service-health table (p95, error rate, RPS, status) |
| GET | `/services/{name}/history?window=` | Per-service latency/error history |
| POST | `/alerts` | Create alert rule (`metric`, `op`, `threshold`, `channel`) |
| GET | `/alerts` / DELETE `/alerts/{id}` | Manage alert rules |
| GET | `/export/services.csv` | CSV export (matches the UI's export) |
| GET | `/healthz` / `/readyz` | Liveness / readiness (anonymous) |

## Representative types
```csharp
public record KpiSet(Kpi Sessions, Kpi Revenue, Kpi Conversion, Kpi ActiveUsers);
public record Kpi(string Label, decimal Value, decimal DeltaPct, int[] Spark);
public record ServiceHealth(string Name, string Region, int P95Ms,
    double ErrorRatePct, int Rps, ServiceStatus Status);
public enum ServiceStatus { Healthy, Degraded, Down }
```

## Route wiring (illustrative)
```csharp
var metrics = app.MapGroup("/api/v1/metrics").RequireAuthorization("read");

metrics.MapGet("/kpis", async Task<Results<Ok<KpiSet>, BadRequest<ProblemDetails>>>
    (TimeWindow window, IMetricsStore store, CancellationToken ct) =>
        TypedResults.Ok(await store.GetKpisAsync(window, ct)))
    .WithName("GetKpis").CacheOutput(p => p.Expire(TimeSpan.FromSeconds(30)));

app.MapPost("/api/v1/ingest/events", (EventBatch batch, IIngestQueue q)
    => { q.Enqueue(batch); return TypedResults.Accepted("/api/v1/ingest/status"); })
   .RequireAuthorization("ingest")
   .RequireRateLimiting("ingest-per-key");
```

## Non-functional
- **Ingestion:** 202-accepted queue (Channels → background `IHostedService` writer); at-least-once, dedup on client `eventId`.
- **Aggregation:** pre-bucketed rollups (minute→hour→day) so dashboard reads are O(buckets), never raw scans.
- **Rate limiting:** built-in `AddRateLimiter` — token bucket per API key on ingest; sliding window on reads.
- **Caching:** `OutputCache` 30 s on KPI/series endpoints; `ETag` on exports.
- **Observability:** OpenTelemetry (ASP.NET Core + HttpClient instrumentation), Prometheus scrape endpoint.
- **Testing:** `WebApplicationFactory` integration tests per endpoint; `TreatWarningsAsErrors` on.
