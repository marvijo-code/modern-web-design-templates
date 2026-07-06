---
name: api-design-typescript
description: Design or extend the nova-saas API (TypeScript + Hono) idiomatically — typed routes, zod validation, RFC 9457 errors, cursor pagination. Use for any change to templates/nova-saas/API.md or new TypeScript API design work in this repo.
---

# API Design — TypeScript · Hono (nova-saas)

Owns `templates/nova-saas/API.md`. Nova is a product-delivery platform (workspaces → projects → releases/stacks/environments).

## Stack choices (fixed)
- **Hono** on Web-standard Request/Response (runs on Node/Bun/Workers). Not Express — no framework-specific req/res mutation.
- **zod** schemas as the single source of truth: validate with `@hono/zod-validator`, document with `@hono/zod-openapi`, infer TS types (`z.infer`), and export `AppType` for the typed `hc` client.

## Conventions to preserve
- Base `/api/v1`, camelCase JSON, bearer auth, workspace scoping via path.
- Errors: RFC 9457 `application/problem+json` — `type`, `title`, `status`, `detail`. Never ad-hoc `{error: string}`.
- Pagination: cursor-based `{ items, nextCursor }`; no offset/limit.
- All POSTs honor `Idempotency-Key`.
- Realtime mirrors webhooks via SSE (`/projects/{id}/events`) — new event types must ship in both.

## When adding an endpoint
1. Define/extend the zod schema first; derive request + response types from it.
2. Add the route with `zValidator` on `json`/`query`/`param`; handler returns `c.json(body, status)` with explicit status.
3. Chain routes on the single `app` instance so `AppType` inference keeps working (no detached routers without `.route()` mounting).
4. Choose verbs/paths RESTfully: sub-resources under their parent (`/projects/{id}/releases`), actions as POST on a noun (`/releases/{id}/deploy`).
5. Update the endpoint table in API.md, plus rate-limit notes if the endpoint moves money/deploys.
6. Testing story: `app.request()` unit tests, no socket.

## Idiom checklist
- `Variables` generic for per-request context (auth user), not module globals.
- 201 + Location for creations; 202 for async work with a status URL; 409 for idempotency conflicts.
- Version by URI major only; additive changes within `/v1`.
