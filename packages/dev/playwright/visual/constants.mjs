/** Shared settings of the visual comparison lane (capture.mjs + compare.mjs). */

export const DEFAULT_BASE_URL = 'http://localhost:9501'
export const DEFAULT_THEME = 'light'
/** Pages captured concurrently */
export const DEFAULT_WORKERS = 4
/** The capture frame gives up after `CAPTURE_TIMEOUT_MS` (30s) and sets `data-capture-error`;
 * this bounds examples that never get that far (e.g. a navigation that hangs) */
export const READY_TIMEOUT_MS = 45000
export const NAVIGATION_TIMEOUT_MS = 30000
/** How long `--serve` waits for the static server to answer */
export const SERVER_START_TIMEOUT_MS = 30000
/** Browser viewport; the capture frame has its own fixed size, so this only needs to contain it */
export const VIEWPORT = { width: 1600, height: 1000 }
/** Same software WebGL pinning as playwright.config.ts, so Leaflet/MapLibre canvases rasterize identically */
export const CHROMIUM_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
export const MANIFEST_FILE = 'manifest.json'

/** pixelmatch per-pixel colour sensitivity (0..1); anti-aliased pixels are excluded by default */
export const PIXEL_THRESHOLD = 0.1
/** Fraction of pixels allowed to differ before an example counts as changed. Two captures of the
 * same build on the same machine are byte-identical in practice (see README), so this only absorbs
 * stray glyph-edge rasterization jitter — a recoloured 2px line (~0.3% of a 1200×800 frame) must fail */
export const MAX_DIFF_RATIO = 0.0005
