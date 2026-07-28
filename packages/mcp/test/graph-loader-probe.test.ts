/** Env-level test for async-layout components (Graph): the renderer must
 * await the component's own onRenderComplete — the container's fires before
 * the layout promise resolves. Runs the raw spec path (no recipe). */
import { describe, expect, it } from 'vitest'

import { renderChart } from '../src/render/renderer.js'

describe('async component rendering', () => {
  it.each(['force', 'circular', 'concentric', 'dagre'])('renders a %s-layout graph to completion', async (layoutType) => {
    const g = await renderChart({
      container: 'single',
      width: 500,
      height: 400,
      theme: 'light',
      components: [{ type: 'Graph', config: { layoutType } }],
      data: { nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], links: [{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }] },
    }, { idPrefix: 'gv-' })
    expect(g.svg.length).toBeGreaterThan(2000)
    expect(g.svg).not.toContain('NaN')
    expect(g.warnings).toEqual([])
  }, 30000)
})
