import { select, Selection } from 'd3-selection'
import { ScaleContinuousNumeric } from 'd3-scale'
import { color } from 'd3-color'

// Core
import { getCSSColorVariable } from 'styles/colors'

// Utils
import { wrapTextElement } from 'utils/text'
import { smartTransition } from 'utils/d3'
import { getNumber, getString } from 'utils/data'
import { getColor, hexToBrightness } from 'utils/color'

// Config
import { ChordDiagramConfig } from '../config'

// Local Types
import { ChordInputLink, ChordInputNode, ChordLabelAlignment, ChordNode } from '../types'

// Styles
import * as s from '../style'

export const LABEL_PADDING = 3

export function createLabel<N extends ChordInputNode, L extends ChordInputLink> (
  selection: Selection<SVGGElement, ChordNode<N>, SVGGElement, unknown>,
  config: ChordDiagramConfig<N, L>,
  radiusScale: ScaleContinuousNumeric<number, number>
): void {
  selection.style('opacity', 0)

  if (config.nodeLabelAlignment === ChordLabelAlignment.Perpendicular) {
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

function getLabelFillColor<N extends ChordInputNode, L extends ChordInputLink> (
  d: ChordNode<N>,
  config: ChordDiagramConfig<N, L>,
  context: SVGTextElement
): string {
  const { nodeLabelAlignment, nodeColor } = config
  switch (nodeLabelAlignment) {
    case ChordLabelAlignment.Perpendicular: {
      return getColor(d, nodeColor, d.depth)
    }
    case ChordLabelAlignment.Along: {
      const c = getColor(d, nodeColor) || window.getComputedStyle(context).getPropertyValue(getCSSColorVariable(d.depth))
      const colorParsed = color(c)
      const brightness = colorParsed ? hexToBrightness(colorParsed.hex()) : 0
      return brightness > 0.65 ? 'var(--vis-chord-diagram-label-text-fill-color-dark)' : 'var(--vis-chord-diagram-label-text-fill-color-bright)'
    }
  }
}

function getLabelTextAnchor<N extends ChordInputNode, L extends ChordInputLink> (
  d: ChordNode<N>,
  config: ChordDiagramConfig<N, L>
): string | null {
  const { nodeLabelAlignment } = config
  switch (nodeLabelAlignment) {
    case ChordLabelAlignment.Perpendicular: {
      const angleCenter = (d.x0 + d.x1) / 2
      const angleDegree = angleCenter * 180 / Math.PI
      return angleDegree < 180 ? 'start' : 'end'
    }
    case ChordLabelAlignment.Along: {
      return null
    }
  }
}

export function updateLabel<N extends ChordInputNode, L extends ChordInputLink> (
  selection: Selection<SVGElement, ChordNode<N>, SVGGElement, unknown>,
  config: ChordDiagramConfig<N, L>,
  width: number,
  radiusScale: ScaleContinuousNumeric<number, number>,
  duration: number
): void {
  const { nodeLabel, nodeWidth, nodeLabelAlignment } = config
  selection.style('opacity', 0)
  const selTransition = smartTransition(selection, duration)
    .style('opacity', 1)
  if (nodeLabelAlignment === ChordLabelAlignment.Perpendicular) {
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

  const label: Selection<SVGTextElement, ChordNode<N>, SVGElement, unknown> = selection.select(`.${s.label}`)
  label.select('textPath').remove()
  label
    .text(d => getString(d.data, nodeLabel))
    .style('display', d => {
      if (config.nodeLabelAlignment === ChordLabelAlignment.Perpendicular) return null
      const radianArcLength = d.x1 - d.x0 - getNumber(d, config.padAngle) * 2
      const radius = radiusScale(d.y1) - getNumber(d, config.nodeWidth) / 2
      const arcLength = radius * radianArcLength
      // Hide label if the length of node arc is less then 70 px
      return arcLength < 70 ? 'none' : null
    })

  label
    .style('fill', d => getLabelFillColor(d, config, label.node()))
    .style('text-anchor', d => getLabelTextAnchor(d, config))

  label
    .each((d: any, i, elements) => {
      let textWidth = width
      if (nodeLabelAlignment === ChordLabelAlignment.Along) {
        const radianArcLength = d.x1 - d.x0 - getNumber(d, config.padAngle) * 2
        const radius = radiusScale(d.y1) - getNumber(d, config.nodeWidth) / 2
        textWidth = radius * radianArcLength
      }

      select(elements[i]).call(wrapTextElement, { width: textWidth - LABEL_PADDING * 2, trimOnly: true })

      if (nodeLabelAlignment === ChordLabelAlignment.Along) {
        const labelText = select(elements[i]).text()
        select(elements[i])
          .attr('dx', LABEL_PADDING)
          .attr('dy', getNumber(d, nodeWidth) / 2)
          .text('')

        select(elements[i]).append('textPath')
          .attr('xlink:href', `#chord-node-${i}`)
          .text(labelText)
      }
    })

  if (nodeLabelAlignment === ChordLabelAlignment.Perpendicular) {
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

export function removeLabel<N extends ChordInputNode, L extends ChordInputLink> (
  selection: Selection<SVGElement, ChordNode<N>, SVGGElement, unknown>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
