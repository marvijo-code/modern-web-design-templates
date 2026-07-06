---
name: api-design-ruby
description: Design or extend the mono-blog API (Ruby on Rails, API-only) idiomatically — REST resources, conditional GET caching, double-opt-in newsletter, Rack::Attack. Use for any change to templates/mono-blog/API.md or new Ruby API design work in this repo.
---

# API Design — Ruby · Rails 8 API-only (mono-blog)

Owns `templates/mono-blog/API.md`. Mono is a single-author blog (posts + categories, JSON feed, double-opt-in newsletter).

## Stack choices (fixed)
- **Rails 8 `--api`**: namespaced `api/v1` routes, Jbuilder views with `key_format camelize: :lower`, Solid Queue for jobs, Action Mailer, Minitest.
- Models own the domain: validations, scopes (`Post.published`), computed values (`reading_minutes`), `has_secure_token` for confirm/unsubscribe tokens, enum statuses.

## Conventions to preserve
- Public reads use conditional GETs (`fresh_when`/`stale?`) so feed readers get 304s — any new public endpoint must set ETag/Last-Modified.
- Newsletter is **double-opt-in**: `pending → confirmed` via emailed token; unsubscribe is token-based one-click AND advertised via the `List-Unsubscribe` mail header. Never weaken either.
- **Privacy is a feature**: no open/click tracking, no subscriber PII export endpoints — author sees counts only. Don't add them.
- `Rack::Attack`: 5 subscription attempts/hour/IP; honeypot param silently dropped.
- Errors: `{ "error": { "code", "message" } }`; 422 carries field details.

## When adding an endpoint
1. Prefer a new RESTful resource (`resources :things, only: […]`) over custom verbs; member/collection routes only when the noun truly can't be a resource.
2. Output through a Jbuilder view — no `render json: model`.
3. Slow side effects → jobs (Solid Queue) with retries/backoff; mailers never inline.
4. Slugs validated `/\A[a-z0-9-]+\z/` and unique; publishing sets `published_at` server-side.
5. Update API.md endpoint table + model snippets; extend the newsletter-flow description if states changed.
6. Testing story: request specs asserting JSON shape AND cache headers; mailer assertions; fixtures over factories.

## Idiom checklist
- Strong params everywhere; no mass assignment of tokens/status.
- Pagination via `page/per` with sane caps.
- Markdown stored; HTML rendered at publish time and cached — render pipelines never run per-request.
