/** Inter font provisioning.
 *
 * Unovis defaults to the Inter font stack, and text measurement drives label
 * trimming, wrapping and axis margins — measuring with the same font the
 * viewer renders keeps geometry faithful. Fonts are resolved in order:
 *
 *  1. `UNOVIS_SSR_FONTS_DIR` (explicit directory of font files; the
 *     pre-extraction `UNOVIS_MCP_FONTS_DIR` name still works)
 *  2. the package's own `fonts/` directory (manually added / bundled)
 *  3. a user-level cache, populated once by downloading the official Inter
 *     release (pinned version + SHA-256 verified) and extracting four static
 *     TTF faces + the OFL license
 *
 * The download is best-effort: offline environments (or
 * `UNOVIS_SSR_NO_DOWNLOAD=1` (or `UNOVIS_MCP_NO_DOWNLOAD=1`)) fall back to system fonts with a one-line
 * stderr note — rendering never fails because of fonts.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, writeFileSync, renameSync, rmSync } from 'node:fs'
import { tmpdir, homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unzipSync } from 'fflate'

const INTER_VERSION = '4.1'
const INTER_URL = `https://github.com/rsms/inter/releases/download/v${INTER_VERSION}/Inter-${INTER_VERSION}.zip`
const INTER_SHA256 = '9883fdd4a49d4fb66bd8177ba6625ef9a64aa45899767dde3d36aa425756b11e'
const DOWNLOAD_TIMEOUT_MS = 60_000

/** Faces used by chart text: Regular (labels), Medium (ticks, weight 500),
 * SemiBold (titles), Bold */
const FACES = ['Inter-Regular.ttf', 'Inter-Medium.ttf', 'Inter-SemiBold.ttf', 'Inter-Bold.ttf']
const LICENSE_ENTRY = 'LICENSE.txt'

const hasFontFiles = (dir: string): boolean => {
  try {
    return readdirSync(dir).some(f => /\.(ttf|otf|woff2?)$/i.test(f))
  } catch {
    return false
  }
}

function cacheDir (): string {
  const base = process.env.XDG_CACHE_HOME || join(homedir(), '.cache')
  return join(base, 'unovis-ssr', 'fonts', `inter-${INTER_VERSION}`)
}

async function downloadInter (targetDir: string): Promise<boolean> {
  const response = await fetch(INTER_URL, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS), redirect: 'follow' })
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${INTER_URL}`)
  const zip = new Uint8Array(await response.arrayBuffer())

  const digest = createHash('sha256').update(zip).digest('hex')
  if (digest !== INTER_SHA256) throw new Error(`checksum mismatch for ${INTER_URL}: ${digest}`)

  const wanted = new Set([...FACES.map(f => `extras/ttf/${f}`), LICENSE_ENTRY])
  const entries = unzipSync(zip, { filter: file => wanted.has(file.name) })
  const missing = [...wanted].filter(name => !entries[name])
  if (missing.length) throw new Error(`entries missing from Inter archive: ${missing.join(', ')}`)

  // Extract to a temp dir and move into place so a killed process can't
  // leave a half-populated cache behind
  const staging = join(tmpdir(), `unovis-ssr-fonts-${process.pid}`)
  rmSync(staging, { recursive: true, force: true })
  mkdirSync(staging, { recursive: true })
  for (const [name, data] of Object.entries(entries)) {
    writeFileSync(join(staging, name.split('/').pop() as string), data)
  }
  mkdirSync(join(targetDir, '..'), { recursive: true })
  rmSync(targetDir, { recursive: true, force: true })
  renameSync(staging, targetDir)
  return true
}

let ensurePromise: Promise<string | undefined> | undefined

/** Resolve a directory containing font files for text measurement, or
 * undefined when none is available (system-font fallback). */
export function ensureFontsDir (): Promise<string | undefined> {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  if (!ensurePromise) ensurePromise = resolveFontsDir()
  return ensurePromise
}

async function resolveFontsDir (): Promise<string | undefined> {
  // Both prefixes: the vars shipped under the MCP name before the extraction
  const explicit = process.env.UNOVIS_SSR_FONTS_DIR ?? process.env.UNOVIS_MCP_FONTS_DIR
  if (explicit) {
    if (hasFontFiles(explicit)) return explicit
    console.error(`unovis-ssr: the configured fonts directory has no font files: ${explicit}`)
  }

  const packageFonts = fileURLToPath(new URL('../../fonts', import.meta.url))
  if (hasFontFiles(packageFonts)) return packageFonts

  const cache = cacheDir()
  if (hasFontFiles(cache)) return cache

  if (process.env.UNOVIS_SSR_NO_DOWNLOAD || process.env.UNOVIS_MCP_NO_DOWNLOAD) return undefined

  try {
    await downloadInter(cache)
    console.error(`unovis-ssr: downloaded Inter ${INTER_VERSION} (SIL OFL 1.1) to ${cache}`)
    return cache
  } catch (e) {
    console.error(`unovis-ssr: Inter download skipped (${e instanceof Error ? e.message : e}) — using system fonts for text measurement`)
    return undefined
  }
}
