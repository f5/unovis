// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'
import { HierarchyRectangularNode } from 'd3-hierarchy'
import { color } from 'd3-color'

// Core
import { getCSSVarName } from 'styles/colors'

// Types
import { Hierarchy, LabelType } from 'types/radial-dendrogram'

// Utils
import { wrapTextElement } from 'utils/text'
import { smartTransition } from 'utils/d3'
import { getValue } from 'utils/data'
import { getColor, hexToBrightness } from 'utils/color'

// Config
import { ChordDiagramConfig } from '../config'

// Styles
import * as s from '../style'

export const LABEL_PADDING = 3

export function createLabel<H extends Hierarchy> (selection: Selection<SVGGElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>, config: ChordDiagramConfig<H>, radiusScale): void {
  selection.style('opacity', 0)

  if (config.nodeLabelType === LabelType.PERPENDICULAR) {
    selection.attr('transform', d => {
      const angleCenter = (d.x0 + d.x1) / 2
      const angle = angleCenter - Math.PI / 2
      const r = radiusScale(d.y1) + LABEL_PADDING
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      return `translate(${x}, ${y})`
    })
  }

  selection.append('text')
    .attr('class', s.label)
    .style('fill', d => getColor(d.data, config.nodeColor, d.depth))
}

function getLabelFillColor (d, config) {
  const { nodeLabelType, nodeColor } = config
  switch (nodeLabelType) {
  case LabelType.PERPENDICULAR: {
    return getColor(d.data, nodeColor, d.depth)
  }
  case LabelType.ALONG: {
    const c = getValue(d.data, nodeColor) || window.getComputedStyle(document.documentElement).getPropertyValue(getCSSVarName(d.depth))
    const hex = color(c).hex()
    const brightness = hexToBrightness(hex)
    return brightness > 0.65 ? 'var(--vis-chord-diagram-label-text-fill-color-dark)' : 'var(--vis-chord-diagram-label-text-fill-color-bright)'
  }
  }
}

function getLabelTextAnchor (d, config) {
  const { nodeLabelType } = config
  switch (nodeLabelType) {
  case LabelType.PERPENDICULAR: {
    const angleCenter = (d.x0 + d.x1) / 2
    const angleDegree = angleCenter * 180 / Math.PI
    return angleDegree < 180 ? 'start' : 'end'
  }
  case LabelType.ALONG: {
    return null
  }
  }
}

export function updateLabel<H extends Hierarchy> (selection: Selection<SVGElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>, config: ChordDiagramConfig<H>, width: number, radiusScale, duration: number): void {
  const { nodeLabel, nodeWidth, nodeLabelType } = config
  selection.style('opacity', 0)
  const selTransition = smartTransition(selection, duration)
    .style('opacity', 1)
  if (nodeLabelType === LabelType.PERPENDICULAR) {
    selTransition.attr('transform', d => {
      const angleCenter = (d.x0 + d.x1) / 2
      const angle = angleCenter - Math.PI / 2
      const r = radiusScale(d.y1) + LABEL_PADDING
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      return `translate(${x}, ${y})`
    })
  } else {
    selection.attr('transform', null)
  }

  const label: Selection<SVGTextElement, any, SVGElement, any> = selection.select(`.${s.label}`)
  label.select('textPath').remove()
  label
    .text(d => getValue(d.data, nodeLabel))
    .style('display', d => {
      const radianArcLength = d.x1 - d.x0 - getValue(d, config.padAngle) * 2
      const radius = radiusScale(d.y1) - getValue(d, config.nodeWidth) / 2
      const arcLength = radius * radianArcLength
      // Hide label if length of node arc less then 70
      return arcLength < 70 ? 'none' : 'block'
    })

  label
    .style('fill', d => getLabelFillColor(d, config))
    .style('text-anchor', d => getLabelTextAnchor(d, config))

  label
    .each((d, i, elements) => {
      let textWidth = width
      if (nodeLabelType === LabelType.ALONG) {
        const radianArcLength = d.x1 - d.x0 - getValue(d, config.padAngle) * 2
        const radius = radiusScale(d.y1) - getValue(d, config.nodeWidth) / 2
        textWidth = radius * radianArcLength
      }

      select(elements[i]).call(wrapTextElement, { width: textWidth - LABEL_PADDING * 2, trimOnly: true })

      if (nodeLabelType === LabelType.ALONG) {
        const labelText = select(elements[i]).text()
        select(elements[i])
          .attr('dx', LABEL_PADDING)
          .attr('dy', getValue(d, nodeWidth) / 2)
          .text('')

        select(elements[i]).append('textPath')
          .attr('xlink:href', `#${d.data.id ?? d.data.key}`)
          .text(labelText)
      }
    })

  if (nodeLabelType === LabelType.PERPENDICULAR) {
    smartTransition(label, duration)
      .attr('transform', d => {
        const angleCenter = (d.x0 + d.x1) / 2
        const angleDegree = angleCenter * 180 / Math.PI

        return `rotate(${angleDegree < 180 ? angleDegree - 90 : angleDegree + 90})`
      })
  } else {
    label.attr('transform', null)
  }
}

export function removeLabel<H extends Hierarchy> (selection: Selection<SVGElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>, duration: number): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
