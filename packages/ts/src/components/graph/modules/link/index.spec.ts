import { afterEach, describe, expect, it } from 'vitest'
import { select } from 'd3-selection'
import type { Selection } from 'd3-selection'
import { curveBasis } from 'd3-shape'
import { timerFlush } from 'd3-timer'

// Core
import { GraphDataModel } from '@/data-models/graph'
import { curveSmoothStep } from '@/utils/curves/smooth-step'

// Types
import type { GraphInputLink, GraphInputNode } from '@/types/graph'
import type { GraphLink, GraphNode } from '../../types'

// Config
import { GraphDefaultConfig } from '../../config'
import type { GraphConfigInterface } from '../../config'

// Modules
import { createLinks, updateLinkLines } from './index'
import * as selectors from './style'

describe('Graph link curves', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  function setup (): {
    groups: Selection<SVGGElement, GraphLink, SVGGElement, unknown>;
    config: GraphConfigInterface<GraphInputNode, GraphInputLink>;
    lengths: Map<string, number>;
    arrowId: () => string;
    model: GraphDataModel<GraphInputNode, GraphInputLink, GraphNode, GraphLink>;
  } {
    const model = new GraphDataModel<GraphInputNode, GraphInputLink, GraphNode, GraphLink>()
    model.data = { nodes: [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 100, y: 80 }], links: [{ source: 'a', target: 'b' }] }
    const groups = select(document.body).append('svg').append('g')
      .selectAll<SVGGElement, GraphLink>('g').data(model.links).join('g')
    groups.call(createLinks)
    groups.selectAll<SVGPathElement, GraphLink>('path').each(function (): void {
      this.getTotalLength = (): number => 100
    })
    const config = { ...GraphDefaultConfig, linkArrow: undefined, linkCurvature: 1 }
    const lengths = new Map<string, number>()
    const arrowId = (): string => ''
    return { groups, config, lengths, arrowId, model }
  }

  it('keeps the default Bezier and sends arbitrary factories through d3-line', () => {
    const { groups, config, lengths, arrowId } = setup()
    groups.call(updateLinkLines, config, 0, 1, arrowId, lengths)
    expect(groups.select(`.${selectors.link}`).attr('d')).toBe('M0,0 C50,0 50,80 100,80')
    groups.call(updateLinkLines, { ...config, linkCurve: curveSmoothStep }, 0, 1, arrowId, lengths)
    const path = groups.select(`.${selectors.link}`).attr('d')
    expect(path).toContain('Q')
    expect(groups.select(`.${selectors.linkSupport}`).attr('d')).toBe(path)
    expect(groups.select(`.${selectors.linkBand}`).attr('d')).toBe(path)
    groups.call(updateLinkLines, { ...config, linkCurve: curveBasis }, 0, 1, arrowId, lengths)
    expect(groups.select(`.${selectors.link}`).attr('d')).toContain('C')
  })

  it('interrupts animated paths when dragging triggers an immediate update', async () => {
    const { groups, config, lengths, arrowId, model } = setup()
    groups.call(updateLinkLines, config, 0, 1, arrowId, lengths)
    const custom = { ...config, linkCurve: curveSmoothStep }
    groups.call(updateLinkLines, custom, 30, 1, arrowId, lengths)
    timerFlush()
    model.nodes[1].x = 200
    groups.call(updateLinkLines, custom, 0, 1, arrowId, lengths)
    const expected = groups.select(`.${selectors.linkSupport}`).attr('d')
    await new Promise(resolve => setTimeout(resolve, 60))
    timerFlush()
    expect(groups.select(`.${selectors.link}`).attr('d')).toBe(expected)
    expect(groups.select(`.${selectors.linkBand}`).attr('d')).toBe(expected)
  })
})
