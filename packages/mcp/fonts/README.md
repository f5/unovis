# Fonts

Font files placed in this directory (`.ttf` / `.otf` / `.woff2`) are registered
with the canvas text-measurement engine at startup — the family name is derived
from the file name (`Inter-Regular.ttf` → `Inter`).

Unovis defaults to the Inter font stack, so for exact text metrics (and
machine-portable test snapshots) add the static Inter faces here:

- `Inter-Regular.ttf`
- `Inter-Bold.ttf`

Inter is available under the SIL Open Font License 1.1 from
<https://github.com/rsms/inter/releases> — include its `LICENSE.txt` alongside
the font files when bundling.

Without font files, system fonts are used for measurement: metrics are close,
but label trimming/wrapping can differ by a few pixels from browser output.
