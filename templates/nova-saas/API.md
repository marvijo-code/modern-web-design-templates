# Nova API — Design Doc (TypeScript · Hono)

**Language:** TypeScript (strict) · **Framework:** [Hono](https://hono.dev) on Node/Bun/Workers · **Why:** Hono is the modern best-in-class TS HTTP framework — Web-standard `Request`/`Response`, first-class type inference from route to client (`hc` RPC client), tiny footprint, runs on every JS runtime. Validation with `zod` via `@hono/zod-validator`; OpenAPI via `@hono/zod-openapi`.

## Domain
Nova is a product-delivery platform: workspaces contain projects; projects have releases, review stacks, and preview environments.

## Conventions
- Base path `/api/v1`, JSON only, `camelCase` fields.
- Auth: `Authorization: Bearer <token>` (PAT or OAuth2); workspace scoping via path.
- Errors: RFC 9457 `application/problem+json` (`type`, `title`, `status`, `detail`).
- Pagination: cursor-based — `?cursor=&limit=` → `{ items, nextCursor }`.
- Idempotency: `Idempotency-Key` header honored on all POSTs.

## Resources & endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/tokens` | Exchange OAuth code / login for bearer token |
| GET | `/workspaces` | List workspaces for caller |
| GET | `/workspaces/{ws}/projects` | List projects (filter `?archived=`) |
| POST | `/workspaces/{ws}/projects` | Create project |
| GET | `/projects/{id}` | Project detail |
| PATCH | `/projects/{id}` | Rename / settings |
| GET | `/projects/{id}/releases` | Paginated releases |
| POST | `/projects/{id}/releases` | Cut a release (`{ ref, channel }`) |
| POST | `/releases/{id}/deploy` | Deploy; guarded by release guards |
| GET | `/releases/{id}/status` | Deploy status + guard evaluations |
| GET | `/projects/{id}/stacks` | Review stacks with per-entry CI state |
| POST | `/stacks/{id}/merge` | Merge whole stack (validates order) |
| GET | `/projects/{id}/environments` | Live preview environments |
| DELETE | `/environments/{id}` | Tear down a preview env |
| GET | `/projects/{id}/insights/dora` | DORA metrics (`?window=30d`) |
| POST | `/webhooks` | Register webhook (`release.deployed`, `stack.merged`, …) |

## Representative schema (zod)
```ts
export const Release = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  channel: z.enum(["canary", "beta", "stable"]),
  status: z.enum(["draft", "deploying", "live", "failed", "rolled_back"]),
  guards: z.array(z.object({ name: z.string(), passed: z.boolean(), detail: z.string().optional() })),
  createdAt: z.string().datetime(),
});
```

## Route wiring (illustrative)
```ts
const app = new Hono<{ Variables: { user: User } }>()
  .use("/api/*", bearerAuth({ verifyToken }))
  .post("/api/v1/projects/:id/releases",
    zValidator("json", CreateRelease),
    async (c) => {
      const release = await releases.cut(c.req.param("id"), c.req.valid("json"), c.get("user"));
      return c.json(release, 201);
    });
export type AppType = typeof app; // consumed by the typed hc<AppType>() client
```

## Non-functional
- **Versioning:** URI major (`/v1`); additive changes only within a major.
- **Rate limits:** 600 req/min per token; `429` + `Retry-After`; deploy endpoints 30/min.
- **Realtime:** SSE at `/api/v1/projects/{id}/events` mirroring webhook payloads.
- **Observability:** OpenTelemetry middleware; every response carries `x-request-id`.
- **Testing:** route handlers unit-tested with `app.request()` (no server socket needed); contract tests generated from the OpenAPI doc.
