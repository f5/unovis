import { select, Selection } from 'd3-selection'
import { HierarchyRectangularNode } from 'd3-hierarchy'

// Utils
import { wrapTextElement } from 'utils/text'
import { smartTransition } from 'utils/d3'
import { getString } from 'utils/data'
import { getColor } from 'utils/color'

// Local Types
import { Hierarchy } from '../types'

// Config
import { RadialDendrogramConfig } from '../config'

// Styles
import * as s from '../style'

export const LABEL_PADDING = 3

export function createLabel<H extends Hierarchy> (selection: Selection<SVGGElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>, config: RadialDendrogramConfig<H>): void {
  selection
    .style('opacity', 0)
    .attr('transform', d => {
      const angleCenter = (d.x0 + d.x1) / 2
      const angle = angleCenter - Math.PI / 2
      const r = d.y1 + LABEL_PADDING
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      return `translate(${x}, ${y})`
    })
  selection.append('text')
    .attr('class', s.label)
    .style('fill', d => getColor(d.data, config.nodeColor, d.depth))
}

export function updateLabel<H extends Hierarchy> (
  selection: Selection<SVGGElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>,
  config: RadialDendrogramConfig<H>,
  width: number,
  duration: number): void {
  const { nodeLabel } = config
  selection.style('opacity', 0)
  smartTransition(selection, duration)
    .style('opacity', 1)
    .attr('transform', d => {
      const angleCenter = (d.x0 + d.x1) / 2
      const angle = angleCenter - Math.PI / 2
      const r = d.y1 + LABEL_PADDING
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      return `translate(${x}, ${y})`
    })
  const label: Selection<SVGTextElement, any, SVGElement, any> = selection.select(`.${s.label}`)
  label
    .text(d => getString(d.data, nodeLabel))
    .style('fill', d => getColor(d.data, config.nodeColor, d.depth))
    .style('display', d => {
      const radianArcLength = d.x1 - d.x0
      const arcLength = 2 * Math.PI * d.y1 * radianArcLength
      // Hide label if length of node arc less then 70
      return arcLength < 70 ? 'none' : 'block'
    })
    .style('text-anchor', d => {
      const angleCenter = (d.x0 + d.x1) / 2
      const angleDegree = angleCenter * 180 / Math.PI
      return angleDegree < 180 ? 'start' : 'end'
    })
    .each((d, i, elements) => {
      select(elements[i])
        .call(wrapTextElement, { width: width - LABEL_PADDING * 2, trimOnly: true })
    })
  smartTransition(label, duration)

    .attr('transform', d => {
      const angleCenter = (d.x0 + d.x1) / 2
      const angleDegree = angleCenter * 180 / Math.PI

      return `rotate(${angleDegree < 180 ? angleDegree - 90 : angleDegree + 90})`
    })
}

export function removeLabel<H extends Hierarchy> (selection: Selection<SVGGElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>, duration: number): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
