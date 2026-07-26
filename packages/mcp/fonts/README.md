# Fonts

Text measurement drives label trimming, wrapping and axis margins, so the
server measures with the same font the output declares (Unovis defaults to
the Inter stack). Fonts are resolved in this order (see `src/env/fonts.ts`):

1. `UNOVIS_MCP_FONTS_DIR` — an explicit directory of font files
2. **this directory** — any `.ttf` / `.otf` / `.woff` files placed here are
   registered at startup; the family name is derived from the file name
   (`Inter-Regular.ttf` → `Inter`)
3. a user-level cache (`~/.cache/unovis-mcp/fonts/`), populated automatically
   on first start by downloading the official
   [Inter release](https://github.com/rsms/inter) — pinned version, SHA-256
   verified, licensed under the SIL Open Font License 1.1 (the license file
   is stored alongside the fonts)

Set `UNOVIS_MCP_NO_DOWNLOAD=1` to disable the download; the server then falls
back to system fonts (metrics are close, but label trimming can differ by a
few pixels from browser output).
