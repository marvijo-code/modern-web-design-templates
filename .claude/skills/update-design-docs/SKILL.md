---
name: update-design-docs
description: Keep every template's DESIGN.md truthful after code changes — token tables, component inventories, interaction lists, breakpoints. Use after editing any template, or for a periodic docs-truth audit ("are the design docs up to date?").
---

# Update Design Docs

Each `templates/<name>/DESIGN.md` is the authoritative design doc for that template. It must describe the template **as shipped**, not as once planned.

## House format (keep sections in this order)
1. **Concept** — one paragraph: the aesthetic idiom, the fictional product, what makes it distinct in the collection.
2. **Design tokens** — a table of every `:root` custom property with value and role. Dual-theme templates (mono-blog) show both values per token.
3. **Typography** — families, display clamp() sizes, weights/tracking, and where serif vs sans vs mono is allowed.
4. **Layout system** — container width, section rhythm, grid patterns, heading lockups.
5. **Signature components** — the template's named devices with *how they're built* (the CSS/JS technique, not just what they look like).
6. **Motion** — every animation/transition and its trigger; note deliberate absences ("no scroll-reveal by design").
7. **Responsive** — each breakpoint and what changes at it.
8. **Accessibility** — ARIA roles/state, live regions, contrast decisions, decorative-content hiding.
9. **Extension rules** (optional) — hard constraints for strict styles.

## Audit procedure
For each template (or the one just changed):
1. Diff `:root` (and `[data-theme]`) variables against the token table — add/remove/correct rows.
2. Grep the `<script>` for event listeners and render functions; every user-facing behavior must appear in Signature components (or the Interaction inventory table where the doc has one).
3. Check `@media` queries against the Responsive section.
4. Check `@keyframes` + `transition` usage against Motion.
5. Keep it a **design doc, not a changelog** — describe current state; never append "Updated on…" history.

Also verify the two repo-level docs when templates are added/renamed: README table and gallery cards (covered by `node scripts/validate.mjs`).
