# Modern Web Design Templates

A curated collection of **12 modern, dependency-free web design templates**. Every template is a single self-contained `index.html` (embedded CSS + JS, system font stacks, zero external requests) so it works offline, from `file://`, or from any static host.

Each template ships with:

- **`index.html`** — the working template (responsive, accessible, interactive).
- **`DESIGN.md`** — a design doc: concept, palette, type scale, layout system, components, interaction notes.
- **`API.md`** — a backend API design for the product the template represents, each in a *different* language using that language's best-in-class framework.

Agent Skills for maintaining, updating, and extending the collection live in [`.claude/skills/`](.claude/skills/).

## Templates

| # | Template | Product | API language / framework |
|---|----------|---------|--------------------------|
| 1 | [nova-saas](templates/nova-saas/) | SaaS landing page | TypeScript / Hono |
| 2 | [pulse-dashboard](templates/pulse-dashboard/) | Analytics dashboard | C# / ASP.NET Core Minimal APIs |
| 3 | [lumen-portfolio](templates/lumen-portfolio/) | Designer portfolio | Go / chi |
| 4 | [verde-restaurant](templates/verde-restaurant/) | Restaurant site | PHP / Laravel |
| 5 | [atlas-travel](templates/atlas-travel/) | Travel agency | Python / FastAPI |
| 6 | [forge-agency](templates/forge-agency/) | Creative agency | Rust / Axum |
| 7 | [mono-blog](templates/mono-blog/) | Editorial blog | Ruby / Ruby on Rails |
| 8 | [haven-realestate](templates/haven-realestate/) | Real-estate listings | Java / Spring Boot |
| 9 | [volt-fitness](templates/volt-fitness/) | Gym / fitness club | Kotlin / Ktor |
| 10 | [drift-store](templates/drift-store/) | E-commerce storefront | Elixir / Phoenix |
| 11 | [orbit-fintech](templates/orbit-fintech/) | Fintech / crypto app | Swift / Vapor |
| 12 | [bloom-events](templates/bloom-events/) | Conference / events | Scala / http4s + Tapir |

Open [`index.html`](index.html) at the repo root for a visual gallery of all templates.

## Using a template

```bash
git clone https://github.com/marvijo-code/modern-web-design-templates.git
cd modern-web-design-templates
# open any template directly…
open templates/nova-saas/index.html
# …or serve the whole collection
npx serve .   # or: python -m http.server 8080
```

No build step, no package manager, no CDN dependencies.

## Verifying the collection

```bash
node scripts/validate.mjs
```

The validator checks every template for: required files (`index.html`, `DESIGN.md`, `API.md`), valid document skeleton (doctype, `lang`, `<title>`, viewport meta), balanced tags, **JS syntax of every inline script**, no external network references, resolvable local links, and gallery coverage. It then serves the repo over HTTP and smoke-tests every page for a 200 response.

## Agent Skills

| Skill | Purpose |
|-------|---------|
| `maintain-templates` | Audit, fix, and keep all templates healthy (run validator, fix regressions). |
| `add-template` | Scaffold a brand-new template with design doc + API doc + gallery/README wiring. |
| `add-feature` | Add a feature or section to an existing template without breaking its design system. |
| `update-design-docs` | Keep every DESIGN.md in sync with its template after changes. |
| `api-design-<language>` | One per template language — design/extend that template's API idiomatically (12 skills). |

## License

[MIT](LICENSE)
