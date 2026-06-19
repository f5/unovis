---
name: open-pr
description: >-
  Open a pull request for the Unovis repo with the project's conventions — correct branch off
  `main`, the standard commit grouping, and the checklist-style PR body used by the maintainers.
  Use when asked to open/create/submit a pull request, prepare a branch for review, or write a PR
  description in this repository.
---

# Opening a PR in Unovis

Mirror the maintainers' real PRs: [#821 Boxplot](https://github.com/f5/unovis/pull/821) and
[#812 RadialBar](https://github.com/f5/unovis/pull/812).

## Branch

- Branch off `main`; never commit directly to `main`.
- Name it for the work, e.g. `feat/boxplot`, `fix/crosshair-threshold`.
- The **F5 CLA bot** comments on a first-time contributor's PR (sign the CLA when prompted). There
  is **no** DCO / `Signed-off-by` requirement.

## Commit grouping

Split the work into logical commits (see `/commit` for the message format). For a **new component**
the maintainers use this 4-commit grouping:

1. `Component | <Name>: New component` — the `packages/ts` core (config, index, style, types, modules)
   plus its export wiring and registry entry.
2. `Dev | Examples: <Name> examples` *(or `Dev | Examples | <Name>: ...`)* — the `packages/dev` pages.
3. `Misc: Framework integrations` — the regenerated wrappers across React/Angular/Svelte/Vue/Solid.
4. `Website: <Name> docs and gallery example` — the `.mdx` doc + `packages/shared/examples` gallery
   entry + previews.

For smaller changes, one well-scoped commit is fine — keep core/dev/website/wrapper concerns in
separate commits when they coexist.

## PR title

- New component: `New Component: <Name> (<milestone>)` — e.g. `New Component: Boxplot (1.7)`.
- Otherwise: a concise summary in the same `Type | Scope: Subject` spirit isn't required for the
  title, but keep it specific.

## PR body

Use the maintainers' checklist template (tick what applies):

```markdown
Adding a new `<Name>` <XY/Core/standalone> component

- [x] Dev examples
- [x] Wrappers
- [x] Gallery example
- [x] Docs

<!-- Light + dark screenshots and/or a short screen recording of the component -->
```

For non-component PRs, write a short summary of **what** changed and **why**, and keep a checklist
of the surfaces touched (core / dev / docs / wrappers) when relevant.

## Create the PR

```bash
git push -u origin <branch>
gh pr create --base main --title "New Component: <Name> (<milestone>)" --body "$(cat <<'EOF'
Adding a new `<Name>` XY component

- [x] Dev examples
- [x] Wrappers
- [x] Gallery example
- [x] Docs
EOF
)"
```

- Attach **light and dark** screenshots (and a short recording for interactive components). If you
  can't produce images, leave a placeholder line in the body and tell the user to drop them in.
- Before pushing, confirm `pnpm lint` is clean and the build passes (CI runs
  `pnpm build && pnpm build:dev`).
