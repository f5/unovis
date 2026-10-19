import { test, expect } from '@playwright/test'

import { LEAFLET_CONTROL_TILE_URL, MIGRATED_CONTROL_EXAMPLES } from './constants'

for (const { path, button } of MIGRATED_CONTROL_EXAMPLES) {
  test(`controls share and reset: ${path}`, async ({ page }) => {
    test.setTimeout(90000)
    page.setDefaultNavigationTimeout(60000)
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.stack ?? error.message))
    // Isolate Leaflet control state from vector renderer initialization and remote styles.
    const initial = {
      plotline: { value: 4 },
      ...(path.includes('/Leaflet/') ? { leafletMap: { renderer: 'raster', style: LEAFLET_CONTROL_TILE_URL, styleDarkTheme: LEAFLET_CONTROL_TILE_URL } } : {}),
    }
    await page.goto(`${path}?capture=1&paused=1&seed=0.73&config=${encodeURIComponent(JSON.stringify(initial))}`)
    const reset = page.getByRole('button', { name: 'Reset', exact: true }).first()
    await expect(reset).toBeVisible()
    const input = page.locator('input:not([disabled]), select:not([disabled])').first()
    let before: string | boolean = ''
    let after: string | boolean = ''
    let checkbox = false
    if (path.includes('/Leaflet/')) await expect(page.locator('.leaflet-container')).toBeVisible()
    if (button) await page.getByRole('button', { name: button, exact: true }).click()
    else {
      checkbox = await input.getAttribute('type') === 'checkbox'
      before = checkbox ? await input.isChecked() : await input.inputValue()
      if (checkbox) await input.setChecked(!before)
      else if (await input.evaluate(element => element.tagName === 'SELECT')) {
        const options = await input.locator('option').evaluateAll(elements => elements.map(element => (element as HTMLOptionElement).value))
        const next = options.find(value => value !== before)
        expect(next).toBeDefined()
        await input.selectOption(next ?? '')
      } else if (await input.getAttribute('type') === 'range') await input.press('End')
      else await input.fill('Shared test')
      if (checkbox) await expect(input).toBeChecked({ checked: !before })
      else await expect(input).not.toHaveValue(before as string)
      after = checkbox ? await input.isChecked() : await input.inputValue()
      expect(after).not.toBe(before)
    }
    await expect.poll(() => new URL(page.url()).searchParams.get('config')).not.toBe(JSON.stringify(initial))
    const changed = new URL(page.url()).searchParams.get('config')
    expect(changed).not.toBe(JSON.stringify(initial))
    await page.reload()
    await expect(reset).toBeVisible()
    expect(new URL(page.url()).searchParams.get('config')).toBe(changed)
    if (!button) {
      if (checkbox) expect(await input.isChecked()).toBe(after)
      else await expect(input).toHaveValue(after as string)
    }
    if (path.includes('Dark%20Theme')) await expect(page.locator('.leaflet-container')).toBeVisible()
    await reset.click()
    if (!button) {
      if (checkbox) await expect(input).toBeChecked({ checked: Boolean(before) })
      else await expect(input).toHaveValue(before as string)
    }
    expect(new URL(page.url()).searchParams.get('seed')).toBe('0.73')
    expect(errors).toEqual([])
  })
}

test('preset changes preserve all updates and nested options', async ({ page }) => {
  await page.goto('/examples/Circular%20Bar/Circular%20Bar%20Playground?capture=1')
  await page.locator('select').first().selectOption('2')
  await expect.poll(() => JSON.parse(new URL(page.url()).searchParams.get('config') ?? '{}').example?.presetIndex).toBe(2)
  const input = JSON.parse(new URL(page.url()).searchParams.get('config') ?? '{}')
  expect(input.example.presetIndex).toBe(2)
  expect(input.example.values).toEqual(Array(12).fill(1))
  await page.locator('input[type="checkbox"]').first().uncheck()
  await expect.poll(() => JSON.parse(new URL(page.url()).searchParams.get('config') ?? '{}').example?.shape?.innerRadius.auto).toBe(false)
  const changed = JSON.parse(new URL(page.url()).searchParams.get('config') ?? '{}')
  expect(changed.example.shape.innerRadius.auto).toBe(false)
  expect(changed.example.presetIndex).toBe(2)
  expect(changed.example.values).toEqual(Array(12).fill(1))
  await page.reload()
  await expect(page.locator('select').first()).toHaveValue('2')
  await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked()
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.locator('select').first()).toHaveValue('0')
  await expect(page.locator('input[type="checkbox"]').first()).toBeChecked()
})

test('playback choice survives reloads through paused', async ({ page }) => {
  await page.goto('/examples/Graph/Dynamic%20Layout?capture=1')
  await page.getByRole('button', { name: 'Resume updates', exact: true }).click()
  await expect.poll(() => new URL(page.url()).searchParams.get('paused')).toBe('0')
  await page.getByRole('button', { name: 'Pause updates', exact: true }).click()
  await expect.poll(() => new URL(page.url()).searchParams.get('paused')).toBe('1')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Resume updates', exact: true })).toBeVisible()
})

test('numeric component controls reflect fractional overrides outside their original ranges', async ({ page }) => {
  const graph = encodeURIComponent(JSON.stringify({ graph: { layoutParallelNodeSpacing: [150.25, 60], layoutParallelGroupSpacing: 600.5 } }))
  await page.goto(`/examples/Graph/Parallel%20Layout%20Spacing?capture=1&config=${graph}`)
  const sliders = page.locator('input[type="range"]')
  await expect(sliders.first()).toHaveValue('150.25')
  await expect(sliders.last()).toHaveValue('600.5')
  await page.reload()
  await expect(sliders.first()).toHaveValue('150.25')
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(sliders.first()).toHaveValue('40')
  await expect(sliders.last()).toHaveValue('300')
  const axis = encodeURIComponent(JSON.stringify({ axis: { tickTextAngle: 270.5 } }))
  await page.goto(`/examples/Axis/Axis%20with%20Ticks%20Rotation%20Slider?capture=1&config=${axis}`)
  await expect(sliders.first()).toHaveValue('270.5')
  await sliders.first().press('Home')
  await expect(sliders.first()).toHaveValue('-180')
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(sliders.first()).toHaveValue('0')
})
