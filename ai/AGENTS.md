# Unovis — AI contributor guide

This file is the source of truth for AI agents (Claude Code, Codex, Cursor) working in this repo.
It lives at `ai/AGENTS.md`; the root `AGENTS.md` and `CLAUDE.md` point here. Keep it short — deep,
step-by-step procedures live in `ai/skills/` (invocable as `/commit`, `/open-pr`, `/add-component`,
`/add-gallery-example`).

## What Unovis is

A modular data-visualization library. The TypeScript core is the source of truth; every framework
wrapper is generated from it.

| Package | Path | Role |
| --- | --- | --- |
| Core | `packages/ts` | The library. All component logic, configs, styles. **Edit here first.** |
| Wrappers | `packages/{react,angular,svelte,vue,solid}` | Thin bindings. **Mostly auto-generated — do not hand-edit generated files.** |
| Shared | `packages/shared` | Gallery examples (`examples/`) + the component registry (`integrations/`) that the generators and commitlint read. |
| Dev | `packages/dev` | React app for visually testing components (`pnpm dev`). |
| Website | `packages/website` | Docusaurus docs + gallery (`pnpm website`). |

## Golden rules — be surgical

1. **Match the surrounding style exactly.** This repo uses ESLint `standard` + `@typescript-eslint/recommended`:
   no semicolons, single quotes, 2-space indent, trailing commas on multiline, **explicit function
   return types**, named imports/exports, max line length 200, `console` only via `.warn`/`.error`.
   Keep the import grouping you see in neighboring files (`// Core`, `// Types`, `// Utils` blocks).
2. **Smallest possible diff.** Change only what the task needs. Never reformat, re-sort imports, or
   touch unrelated lines. Don't bump dependencies or rewrite working code as a "drive-by".
3. **Don't add comments unless they earn their place.** Match the existing comment density.
4. **Never edit a file that starts with `// !!! This code was automatically generated !!!`.**
   Change the source + regenerate (see `/add-component`).
5. **Reuse before you write.** Copy the structure of an existing sibling (e.g.
   `packages/ts/src/components/line` or `scatter`) instead of inventing a new shape. Search for an
   existing util/accessor/type before adding one.
6. **Verify before you claim done.** Run `pnpm lint` and the relevant `pnpm build:*`; for visual
   components, check `pnpm dev`.
7. **Constants live in a dedicated `constants.ts`.** When you introduce constants, put them in a
   `constants.ts` next to the code that uses them (see
   `packages/ts/src/components/{crosshair,donut,timeline}/constants.ts`) — never inline them in the
   middle of a component, a util file, or anywhere else.
8. **Use the repo's type-check helpers.** For runtime type checks reach for the helpers in
   `@/utils/data` (`isString`, `isNumber`, `isFunction`, `isArray`, `isObject`, `isPlainObject`)
   instead of hand-writing `typeof x === 'string'`, `typeof x === 'function'`, or `Array.isArray(…)`.

## Setup & commands

- **Tooling versions are pinned — read them, don't assume.** Package manager: the `packageManager`
  field in `package.json` (use Corepack). Node: `.nvmrc`. Don't hardcode version numbers in code or docs.
- Install: `pnpm install`
- Local dev:
  - `pnpm dev` — visual test app for core components → http://localhost:9500
  - `pnpm dev:gallery` — multi-framework gallery playground (React/Vue/Solid/Svelte/TS) → URL printed by Vite
  - `pnpm website` — docs + gallery → http://localhost:9300
- Build (order matters — **core first**): `pnpm build:ts`, then `pnpm build:react` / `build:angular` / `build:svelte` / `build:vue` / `build:solid` / `build:website`. `pnpm build` does all of them.
- Lint: `pnpm lint` (check) / `pnpm lint:fix` (autofix). `pre-commit` runs `lint-staged` on staged files automatically.
- CI (`.github/workflows/pull_request.yml`) runs `pnpm build && pnpm build:dev` on every PR.

## Commits

Commitlint (`commitlint.config.ts`) enforces a **custom format — not Conventional Commits**:

```
Type | Scope | Subscope: Sentence-case subject
```

- **Type** (required) — one of: `React`, `Angular`, `Vue`, `Svelte`, `Solid`, `Website`, `Dev`,
  `Shared`, `Core`, `Component`, `Container`, `Release`, `CI`, `Misc`.
- **Scope** — PascalCase; omit only for `Release`/`CI`. For type `Component` it should be a
  registered component name. **Subject** — sentence case, no trailing period.
- The `commit-msg` hook validates every message. Don't use `--no-verify` unless asked.

Examples:

```
Component | Crosshair: Add configurable visibility threshold
Component | Brush: New `brushHeightExtend` config option
Core | Utils | trimSVGText: Fix fontSize value parsing
Dev | Examples | Axis: Add tick text alignment example
Website | Docs | Theming: Add SVG filters section
Misc: Framework integrations
```

Full rules, the parser regex, the type-picking cheatsheet, and ~25 real examples: **`/commit`**.

## Pull requests

- Branch from `main` (don't commit to `main` directly). The **F5 CLA bot** comments on first-time
  contributions; there is no DCO/sign-off requirement.
- PR body uses a checklist (Dev examples / Wrappers / Gallery example / Docs) with screenshots.
- Full procedure, the commit-grouping convention, and the body template: **`/open-pr`**.
- Reference PRs: [#821 Boxplot](https://github.com/f5/unovis/pull/821),
  [#812 RadialBar](https://github.com/f5/unovis/pull/812).

## Deep workflows

- **Add a component:** `/add-component` — TS core → registry → `pnpm generate` → dev example →
  gallery → docs. Prose tutorial: `packages/website/contributing/guides/adding-a-component.mdx`.
- **Add a gallery example:** `/add-gallery-example` — files in `packages/shared/examples/<slug>/`,
  register in `examples-list.tsx`, previews in `_previews/`. Prose tutorial:
  `packages/website/contributing/guides/gallery-examples.mdx`.

## Notes for agents

- The `ai/skills/*/SKILL.md` files are symlinked into `.claude/skills/`, `.codex/prompts/`, and
  `.cursor/commands/`. Edit the canonical file in `ai/skills/`; all tools follow the symlink.
- Symlinks require `core.symlinks=true` on Windows checkouts (macOS/Linux are fine).
