import { test, expect } from '@playwright/test'
import type { Layer } from 'leaflet'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { LeafletMap } from '../../../ts/src/components/leaflet-map'
import { LEAFLET_CONTROL_TILE_URL, LEAFLET_VECTOR_TEST_DATA, LEAFLET_VECTOR_TEST_STYLE } from './constants'

test('MapLibre capture waits for source loading and reports rendering errors', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.stack ?? error.message))
  let release = (): void => undefined
  const pending = new Promise<void>(resolve => { release = resolve })
  let requested = false
  await page.route('**/capture-map.geojson', async route => {
    requested = true
    await pending
    await route.fulfill({ json: LEAFLET_VECTOR_TEST_DATA })
  })
  const config = { leafletMap: { style: LEAFLET_VECTOR_TEST_STYLE, styleDarkTheme: LEAFLET_VECTOR_TEST_STYLE, preserveDrawingBuffer: true } }
  await page.goto(`/examples/Leaflet/Vector%20Map?capture=1&config=${encodeURIComponent(JSON.stringify(config))}`)
  const frame = page.getByTestId('example-capture')
  try {
    await expect(page.locator('.leaflet-container')).toBeVisible()
    await expect.poll(() => requested || errors.length > 0).toBe(true)
    await frame.screenshot({ path: testInfo.outputPath('initial.png') })
    await testInfo.attach('browser-errors', { body: JSON.stringify(errors, null, 2), contentType: 'application/json' })
    expect(errors).toEqual([])
    await page.waitForTimeout(600)
    await expect(frame).toHaveAttribute('data-capture-ready', 'false')
    await expect(frame).toHaveAttribute('data-capture-pending', /MapLibre/)
    release()
    await expect(frame).toHaveAttribute('data-capture-ready', 'true', { timeout: 15000 })
    await expect(frame).not.toHaveAttribute('data-capture-error')
    await page.mouse.move(1250, 700)
    await frame.screenshot({ path: testInfo.outputPath('ready.png') })
    const ready = await page.locator('.leaflet-container').screenshot({ path: testInfo.outputPath('map-before.png') })
    await page.getByRole('button', { name: 'Reset', exact: true }).click()
    await page.mouse.move(1250, 700)
    await page.waitForTimeout(1000)
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    expect((await page.locator('.leaflet-container').screenshot({ path: testInfo.outputPath('map-after.png') })).equals(ready)).toBe(true)
    await page.getByRole('button', { name: 'Hide Map', exact: true }).click()
    await expect(page.locator('.leaflet-container')).toHaveCount(0)
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    await page.getByRole('button', { name: 'Show Map', exact: true }).click()
    await expect(page.locator('.maplibregl-canvas')).toBeVisible()
    await expect(frame).toHaveAttribute('data-capture-ready', 'true', { timeout: 15000 })
    expect(errors).toEqual([])
  } finally { release() }
})

test('MapLibre also renders and preserves refs in ordinary gallery mode', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/capture-map.geojson', route => route.fulfill({ json: LEAFLET_VECTOR_TEST_DATA }))
  const config = { leafletMap: { style: LEAFLET_VECTOR_TEST_STYLE } }
  await page.goto(`/examples/Leaflet/Vector%20Map?code=0&config=${encodeURIComponent(JSON.stringify(config))}`)
  await expect(page.locator('.maplibregl-canvas')).toBeVisible()
  await expect.poll(() => page.getByRole('figure').evaluate(async element => {
    const component = (element as HTMLElement & Record<'__component__', LeafletMap<Record<string, unknown>>>).__component__
    const map = await component.getLeafletInstancePromise()
    let loaded = false
    map.eachLayer((layer: Layer & { getMaplibreMap?: () => MapLibreMap }) => { loaded ||= layer.getMaplibreMap?.().loaded() ?? false })
    return loaded
  })).toBe(true)
  await page.getByRole('button', { name: 'Hide Map', exact: true }).click()
  await expect(page.locator('.leaflet-container')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('raster capture waits for tiles and invalidates readiness on movement', async ({ page }) => {
  let release = (): void => undefined
  const pending = new Promise<void>(resolve => { release = resolve })
  let requested = false
  await page.route('**/capture-tiles/**', async route => {
    requested = true
    await pending
    await route.fulfill({ contentType: 'image/png', body: Buffer.from(LEAFLET_CONTROL_TILE_URL.split(',')[1], 'base64') })
  })
  const config = { leafletMap: { renderer: 'raster', style: 'http://localhost:9501/capture-tiles/{z}/{x}/{y}.png' } }
  await page.goto(`/examples/Leaflet/Vector%20Map?capture=1&config=${encodeURIComponent(JSON.stringify(config))}`)
  const frame = page.getByTestId('example-capture')
  try {
    await expect.poll(() => requested).toBe(true)
    await page.waitForTimeout(600)
    await expect(frame).toHaveAttribute('data-capture-ready', 'false')
    release()
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    const map = page.locator('.leaflet-container')
    await map.hover({ position: { x: 600, y: 300 } })
    await page.mouse.down()
    await page.mouse.move(700, 400, { steps: 8 })
    await expect(frame).toHaveAttribute('data-capture-ready', 'false')
    await page.mouse.up()
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    await expect(frame).not.toHaveAttribute('data-capture-error')
  } finally { release() }
})

test('capture reports MapLibre source failures', async ({ page }) => {
  await page.route('**/capture-map.geojson', route => route.fulfill({ status: 404, body: 'Not Found' }))
  const config = { leafletMap: { style: LEAFLET_VECTOR_TEST_STYLE } }
  await page.goto(`/examples/Leaflet/Vector%20Map?capture=1&config=${encodeURIComponent(JSON.stringify(config))}`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-error', /MapLibre:.*404/)
  await expect(frame).toHaveAttribute('data-capture-ready', 'false')
})

test('capture reports raster tile failures', async ({ page }) => {
  await page.route('**/capture-tiles/**', route => route.fulfill({ status: 404, body: 'Not Found' }))
  const config = { leafletMap: { renderer: 'raster', style: 'http://localhost:9501/capture-tiles/{z}/{x}/{y}.png' } }
  await page.goto(`/examples/Leaflet/Vector%20Map?capture=1&config=${encodeURIComponent(JSON.stringify(config))}`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-error', /Leaflet tile failed to load|Image failed to load/)
  await expect(frame).toHaveAttribute('data-capture-ready', 'false')
})

test('capture reports WebGL context loss', async ({ page }) => {
  await page.route('**/capture-map.geojson', route => route.fulfill({ json: LEAFLET_VECTOR_TEST_DATA }))
  const config = { leafletMap: { style: LEAFLET_VECTOR_TEST_STYLE } }
  await page.goto(`/examples/Leaflet/Vector%20Map?capture=1&config=${encodeURIComponent(JSON.stringify(config))}`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  await page.locator('.maplibregl-canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })))
  await expect(frame).toHaveAttribute('data-capture-error', 'MapLibre WebGL context lost')
  await expect(frame).toHaveAttribute('data-capture-ready', 'false')
})
