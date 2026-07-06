---
name: maintain-templates
description: Audit, fix, and keep all templates in this repo healthy — run the validator and a real-browser smoke test, fix regressions without breaking each template's design system, and keep docs/gallery/README in sync. Use for "check the templates", "fix template X", "update all templates", or any repo-wide maintenance pass.
---

# Maintain Templates

## Ground rules
- Every template is a **single self-contained `index.html`** — embedded CSS + JS, system font stacks, **zero external network requests** (no CDNs, no Google Fonts, no remote images). Never add one.
- Each template dir must always contain exactly: `index.html`, `DESIGN.md`, `API.md`.
- Each template has its own design system documented in its `DESIGN.md` (tokens, type, layout, extension rules). Read it **before** editing that template; changes must obey it (e.g. forge-agency forbids gradients/shadows/border-radius; mono-blog requires all colors as dual-theme variables).

## Maintenance loop
1. **Validate:** `node scripts/validate.mjs` — checks required files, doctype/lang/title/viewport, balanced script tags, **JS syntax of every inline script**, no external refs, local link resolution, gallery/README coverage, and HTTP 200 smoke over every page. Must exit 0.
2. **Browser smoke:** load each page headless (Playwright/Puppeteer, any Chromium), assert zero `console.error` / `pageerror`, click one interactive control per page. Viewport 1280×900, plus 375×812 for anything layout-touching.
3. **Fix forward:** diagnose in the source `index.html` (all logic is inline at the bottom of the file), fix, re-run steps 1–2.
4. **Sync docs:** if behavior/visuals changed, update that template's `DESIGN.md` (see `update-design-docs` skill) and, if endpoints are implied, its `API.md`.
5. **Commit per template** (`fix(<template>): …`), push after each logical unit.

## Repo-wide invariants (check when touching multiple templates)
- Gallery `index.html` at repo root links every `templates/<name>/index.html` with an accurate description + language tag.
- README template table matches the `templates/` directory exactly (name, product, API language/framework).
- Validator minimum is **10 templates** — never delete below that; prefer fixing to deleting.
- Marquee/ticker components duplicate their track in JS for seamless `-50%` loops — keep that pattern if editing them.
- All interactive controls are real `<button>`/`<a>`/`<input>` with ARIA state (`aria-selected`, `aria-pressed`, `role=tablist`, live regions) — preserve on refactor.

## Common failure modes
- A new external `href`/`src` (validator fails "external network reference") — inline the asset instead.
- Inline-script syntax errors from template-literal edits — the validator's vm check catches these; run it before committing.
- Grid changes that break the ≤900px collapse — check each template's `@media` rules listed in its DESIGN.md.
