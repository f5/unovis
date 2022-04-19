import { select, Selection } from 'd3-selection'
import { ScaleContinuousNumeric } from 'd3-scale'
import { HierarchyRectangularNode } from 'd3-hierarchy'
import { color } from 'd3-color'

// Core
import { getCSSColorVariable } from 'styles/colors'

// Types
import { Hierarchy, LabelType } from 'components/radial-dendrogram/types'

// Utils
import { wrapTextElement } from 'utils/text'
import { smartTransition } from 'utils/d3'
import { getNumber, getString } from 'utils/data'
import { getColor, hexToBrightness } from 'utils/color'

// Config
import { ChordDiagramConfig } from '../config'

// Styles
import * as s from '../style'

export const LABEL_PADDING = 3

export function createLabel<H extends Hierarchy> (
  selection: Selection<SVGGElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>,
  config: ChordDiagramConfig<H>,
  radiusScale: ScaleContinuousNumeric<number, number>
): void {
  selection.style('opacity', 0)

  if (config.nodeLabelType === LabelType.Perpendicular) {
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
    .style('fill', d => getColor(d, config.nodeColor, d.depth))
}

function getLabelFillColor<H extends Hierarchy> (
  d: HierarchyRectangularNode<H>,
  config: ChordDiagramConfig<H>,
  context: SVGTextElement
): string {
  const { nodeLabelType, nodeColor } = config
  switch (nodeLabelType) {
    case LabelType.Perpendicular: {
      return getColor(d, nodeColor, d.depth)
    }
    case LabelType.Along: {
      const c = getColor(d, nodeColor) || window.getComputedStyle(context).getPropertyValue(getCSSColorVariable(d.depth))
      const colorParsed = color(c)
      const brightness = colorParsed ? hexToBrightness(colorParsed.hex()) : 0
      return brightness > 0.65 ? 'var(--vis-chord-diagram-label-text-fill-color-dark)' : 'var(--vis-chord-diagram-label-text-fill-color-bright)'
    }
  }
}

function getLabelTextAnchor<H extends Hierarchy> (d: HierarchyRectangularNode<H>, config: ChordDiagramConfig<H>): string | null {
  const { nodeLabelType } = config
  switch (nodeLabelType) {
    case LabelType.Perpendicular: {
      const angleCenter = (d.x0 + d.x1) / 2
      const angleDegree = angleCenter * 180 / Math.PI
      return angleDegree < 180 ? 'start' : 'end'
    }
    case LabelType.Along: {
      return null
    }
  }
}

export function updateLabel<H extends Hierarchy> (
  selection: Selection<SVGElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>,
  config: ChordDiagramConfig<H>,
  width: number,
  radiusScale: ScaleContinuousNumeric<number, number>,
  duration: number
): void {
  const { nodeLabel, nodeWidth, nodeLabelType } = config
  selection.style('opacity', 0)
  const selTransition = smartTransition(selection, duration)
    .style('opacity', 1)
  if (nodeLabelType === LabelType.Perpendicular) {
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
    .text(d => getString(d.data, nodeLabel))
    .style('display', d => {
      const radianArcLength = d.x1 - d.x0 - getNumber(d, config.padAngle) * 2
      const radius = radiusScale(d.y1) - getNumber(d, config.nodeWidth) / 2
      const arcLength = radius * radianArcLength
      // Hide label if length of node arc less then 70
      return arcLength < 70 ? 'none' : 'block'
    })

  label
    .style('fill', d => getLabelFillColor(d, config, label.node()))
    .style('text-anchor', d => getLabelTextAnchor(d, config))

  label
    .each((d, i, elements) => {
      let textWidth = width
      if (nodeLabelType === LabelType.Along) {
        const radianArcLength = d.x1 - d.x0 - getNumber(d, config.padAngle) * 2
        const radius = radiusScale(d.y1) - getNumber(d, config.nodeWidth) / 2
        textWidth = radius * radianArcLength
      }

      select(elements[i]).call(wrapTextElement, { width: textWidth - LABEL_PADDING * 2, trimOnly: true })

      if (nodeLabelType === LabelType.Along) {
        const labelText = select(elements[i]).text()
        select(elements[i])
          .attr('dx', LABEL_PADDING)
          .attr('dy', getNumber(d, nodeWidth) / 2)
          .text('')

        select(elements[i]).append('textPath')
          .attr('xlink:href', `#${d.data.id ?? d.data.key}`)
          .text(labelText)
      }
    })

  if (nodeLabelType === LabelType.Perpendicular) {
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

export function removeLabel<H extends Hierarchy> (
  selection: Selection<SVGElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
