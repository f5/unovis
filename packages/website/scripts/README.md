# Agent documentation generation

- `/llms.txt` is the concise discovery index in `static/llms.txt`. Keep detailed content behind links.
- `static/llms/fundamentals.md`, `frameworks.md`, and `mcp.md` are maintained guides. Verify examples and statements against the current core, wrappers, and MCP schemas when updating them.
- `pnpm sync:llms` generates `static/llms/api/` from core configuration interfaces and the existing shared component registry. It includes inherited properties and supporting public types. Edit the TypeScript source, not the generated files. Node follows the repository's `.nvmrc`.
- `pnpm sync:mcp-docs` publishes MCP documentation both as Docusaurus pages and as clean `.md` files under `/docs/mcp/`. Its source remains `packages/mcp/docs/`.
- `pnpm sync:gallery-prompts` retains `/llm.txt` as the complete gallery prompt catalog, generated from shared example metadata. The singular path is linked as optional material from the main index.

Website start and build regenerate these files. The generated `static/llms/api/` references, `static/llm.txt` catalog, and `static/docs/mcp/` Markdown copies are ignored by Git; commit their source files and generators instead. Keep the maintained `static/llms.txt` index and the three guides under `static/llms/` in Git.

After changing a public config, type, registry entry, or example metadata, regenerate the relevant output to verify it. Check that all local Markdown links resolve, the main index stays small, and generated properties/defaults match the core source. The global `rel="describedby"` link advertises `/llms.txt` without adding visible UI.
