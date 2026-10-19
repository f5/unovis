import { test, expect } from '@playwright/test'
import { CAPTURE_TIMEOUT_MS } from '../../src/capture/constants'
import { LEAFLET_CONTROL_TILE_URL, PLOTLINE_EXAMPLE_PATH } from './constants'

test('capture reports failed font loading without an unhandled rejection', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    document.fonts.load = (): Promise<FontFace[]> => Promise.reject(new Error('Test font unavailable'))
  })
  await page.goto(`${PLOTLINE_EXAMPLE_PATH}?capture=1`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-error', 'Failed to load capture fonts: Test font unavailable')
  await expect(frame).toHaveAttribute('data-capture-ready', 'false')
  await expect(frame.locator('svg')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('capture reports stalled font loading', async ({ page }) => {
  await page.clock.install()
  await page.addInitScript(() => {
    document.fonts.load = (): Promise<FontFace[]> => new Promise(() => undefined)
  })
  await page.goto(`${PLOTLINE_EXAMPLE_PATH}?capture=1`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-pending', 'Loading fonts')
  await page.clock.fastForward(CAPTURE_TIMEOUT_MS + 1)
  await expect(frame).toHaveAttribute('data-capture-error', 'Timed out waiting for capture fonts')
  await expect(frame).toHaveAttribute('data-capture-ready', 'false')
})

test('capture waits for images and reports a failed image', async ({ page }) => {
  let release = (): void => undefined
  const pending = new Promise<void>(resolve => { release = resolve })
  await page.route('**/capture-test-image.png', async route => {
    await pending
    await route.fulfill({ contentType: 'image/png', body: Buffer.from(LEAFLET_CONTROL_TILE_URL.split(',')[1], 'base64') })
  })
  await page.goto(`${PLOTLINE_EXAMPLE_PATH}?capture=1`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  try {
    await frame.locator('> div').evaluate(element => {
      const image = document.createElement('img')
      image.src = '/capture-test-image.png'
      element.append(image)
    })
    await expect(frame).toHaveAttribute('data-capture-ready', 'false')
    await expect(frame).toHaveAttribute('data-capture-pending', 'Waiting for images')
    release()
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  } finally { release() }
  await frame.locator('> div').evaluate(element => {
    const image = document.createElement('img')
    image.src = 'data:image/png;base64,broken'
    element.append(image)
  })
  await expect(frame).toHaveAttribute('data-capture-error', /^Image failed to load:/)
  await expect(frame).toHaveAttribute('data-capture-ready', 'false')
})

test('capture reports the pending work when readiness times out', async ({ page }) => {
  await page.clock.install()
  await page.goto(`${PLOTLINE_EXAMPLE_PATH}?capture=1`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  await frame.locator('> div').evaluate(element => {
    element.setAttribute('aria-busy', 'true')
    element.setAttribute('data-capture-pending', 'Waiting for test layout')
  })
  await expect(frame).toHaveAttribute('data-capture-ready', 'false')
  await page.clock.fastForward(1000)
  await expect(frame).toHaveAttribute('data-capture-pending', 'Waiting for test layout')
  await page.clock.fastForward(CAPTURE_TIMEOUT_MS)
  await expect(frame).toHaveAttribute('data-capture-error', 'Capture timed out: Waiting for test layout')
  await expect(frame).toHaveAttribute('data-capture-ready', 'false')
})

for (const event of ['error', 'unhandledrejection']) {
  test(`capture reports ${event} and requires a reload after failure`, async ({ page }) => {
    await page.goto(`${PLOTLINE_EXAMPLE_PATH}?capture=1`)
    const frame = page.getByTestId('example-capture')
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    await page.evaluate(name => {
      window.dispatchEvent(name === 'error'
        ? new ErrorEvent('error', { message: 'Test runtime failure' })
        : new PromiseRejectionEvent('unhandledrejection', { reason: new Error('Test runtime failure'), promise: Promise.resolve() }))
    }, event)
    await expect(frame).toHaveAttribute('data-capture-error', /Test runtime failure/)
    await expect(frame).toHaveAttribute('data-capture-ready', 'false')
    await page.getByLabel('Text:', { exact: true }).fill('Still failed')
    await expect(frame).toHaveAttribute('data-capture-ready', 'false')
    await page.reload()
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    await expect(frame).not.toHaveAttribute('data-capture-error')
  })
}
