---
name: add-template
description: Scaffold a brand-new web design template in this repo — a self-contained index.html with a distinct design system, a DESIGN.md design doc, an API.md in a NEW language/framework, gallery + README wiring, and validation. Use when asked to "add a template", "create a new design", or extend the collection.
---

# Add a Template

## Naming & placement
- Directory: `templates/<brand>-<product>/` (e.g. `nova-saas`, `volt-fitness`) — short fictional brand + product category.
- Required files: `index.html`, `DESIGN.md`, `API.md`. Nothing else.

## index.html requirements
- Single self-contained file: `<!doctype html>`, `<html lang="en">`, `<title>`, viewport meta; all CSS in one `<style>`, all JS in one `<script>` at the end. **No external requests of any kind** (validator enforces).
- System font stacks only (sans, Georgia serif, ui-monospace) — differentiate via palette, scale, and layout, not webfonts.
- A **distinct design system**: define CSS custom properties in `:root` (bg/surface/line/text/dim + 1–2 accents) and use them exclusively. Check existing templates' DESIGN.md files and pick an unoccupied aesthetic (current spread: glass SaaS, dark dashboard, light editorial, botanical, airy travel, brutalist, typographic blog, trust/navy, neon, craft store, deep-space, festival gradient).
- At least **two real interactive behaviors** driven by data objects (filterable grid, tabs, cart, calculator, countdown, theme toggle…). Render from JS data structures, not hardcoded repetition.
- Responsive: grids collapse ≤~900px and ≤~560px; wide content scrolls in its own container; `overflow-x: clip` on body if using marquees/glows.
- Accessibility: real buttons/labels, ARIA state on tabs/toggles (`aria-selected`, `aria-pressed`), `role="status"` for form feedback, decorative art `aria-hidden`.
- Visual placeholders are CSS/SVG/gradients/emoji — never image files.

## DESIGN.md
Follow the house format (see any existing one): Concept · Design tokens table · Typography · Layout system · Signature components · Motion · Responsive · Accessibility (+ Extension rules if the style is strict).

## API.md — new language rule
Each template's API design must use a **language not yet used** by any other template, with that language's best-in-class framework. Already taken: TypeScript/Hono, C#/ASP.NET Core, Go/chi, PHP/Laravel, Python/FastAPI, Rust/Axum, Ruby/Rails, Java/Spring Boot, Kotlin/Ktor, Elixir/Phoenix, Swift/Vapor, Scala/http4s+Tapir. Good next picks: Dart/shelf or serverpod, F#/Giraffe, Clojure/reitit, Zig/http.zig, OCaml/Dream, Haskell/Servant.
Follow the house format: header (language/framework/why) · Domain · Conventions · endpoint table · representative typed models · illustrative route wiring in that language · a domain-specific flow (the interesting hard part) · Non-functional (storage, caching, rate limits, observability, testing). Also create the matching `.claude/skills/api-design-<language>/SKILL.md`.

## Wiring & verification
1. Add a card to the root gallery `index.html` (thumb gradient/colors, description, category + language tags).
2. Add a row to the README template table and bump counts in README/gallery copy ("N templates").
3. `node scripts/validate.mjs` must pass; headless-browser check the new page for zero console errors.
4. Commit as `feat: <name> template` and push.
