import { select, Selection } from 'd3-selection'
import { ScaleContinuousNumeric } from 'd3-scale'
import { color } from 'd3-color'

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

function getLabelFillColor<N extends ChordInputNode, L extends ChordInputLink> (
  d: ChordNode<N>,
  config: ChordDiagramConfig<N, L>
): string {
  const { nodeLabelAlignment, nodeColor } = config
  switch (nodeLabelAlignment) {
    case ChordLabelAlignment.Perpendicular: {
      return getColor(d.data, nodeColor, d.height)
    }
    case ChordLabelAlignment.Along: {
      const c = getColor(d.data, nodeColor, d.height)
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

function getLabelTransform<N extends ChordInputNode, L extends ChordInputLink> (
  d: ChordNode<N>,
  config: ChordDiagramConfig<N, L>,
  radiusScale: ScaleContinuousNumeric<number, number>
): string | null {
  const { nodeLabelAlignment } = config
  switch (nodeLabelAlignment) {
    case ChordLabelAlignment.Perpendicular: {
      const r = radiusScale(d.y1) + LABEL_PADDING
      const angleCenter = (d.x0 + d.x1) / 2
      const angle = angleCenter - Math.PI / 2
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      return `translate(${x}, ${y})`
    }
    case ChordLabelAlignment.Along:
      return null
  }
}

export function createLabel<N extends ChordInputNode, L extends ChordInputLink> (
  selection: Selection<SVGGElement, ChordNode<N>, SVGGElement, unknown>,
  config: ChordDiagramConfig<N, L>,
  radiusScale: ScaleContinuousNumeric<number, number>
): void {
  selection.style('opacity', 0)
    .attr('transform', d => getLabelTransform(d, config, radiusScale))

  selection.append('text')
    .attr('class', s.label)
    .style('fill', d => getColor(d.data, config.nodeColor, d.depth))
}

export function updateLabel<N extends ChordInputNode, L extends ChordInputLink> (
  selection: Selection<SVGGElement, ChordNode<N>, SVGGElement, unknown>,
  config: ChordDiagramConfig<N, L>,
  width: number,
  radiusScale: ScaleContinuousNumeric<number, number>,
  duration: number
): void {
  const { nodeLabel, nodeWidth, nodeLabelAlignment } = config

  smartTransition(selection, duration)
    .attr('transform', d => getLabelTransform(d, config, radiusScale))
    .style('opacity', 1)

  const label: Selection<SVGTextElement, ChordNode<N>, SVGElement, unknown> = selection.select(`.${s.label}`)
  label.select('textPath').remove()
  label
    .text(d => getString(d.data, nodeLabel))
    .style('fill', d => getLabelFillColor(d, config))
    .style('text-anchor', d => getLabelTextAnchor(d, config))

  label.each((d: ChordNode<N>, i: number, elements) => {
    const radianArcLength = d.x1 - d.x0 - getNumber(d, config.padAngle) * 2
    const radius = radiusScale(d.y1) - getNumber(d, config.nodeWidth) / 2
    const arcLength = radius * radianArcLength
    const maxWidth = (nodeLabelAlignment === ChordLabelAlignment.Along ? arcLength : width) - LABEL_PADDING * 2

    select(elements[i]).call(wrapTextElement, { width: maxWidth, trimOnly: true })

    if (nodeLabelAlignment === ChordLabelAlignment.Along) {
      const textElement = select(elements[i])
      const textWidth = textElement.node().getBoundingClientRect().width
      const labelText = textElement.text()

      select(elements[i])
        .text('')
        .attr('dx', LABEL_PADDING)
        .attr('dy', getNumber(d.data, nodeWidth) / 2)
        .style('display', textWidth > maxWidth && 'none')

      select(elements[i]).append('textPath')
        .attr('href', `#${d.uid}`)
        .text(labelText)
    } else {
      smartTransition(label, duration)
        .attr('transform', d => {
          const angleCenter = (d.x0 + d.x1) / 2
          const angleDegree = angleCenter * 180 / Math.PI
          return `rotate(${angleDegree < 180 ? angleDegree - 90 : angleDegree + 90})`
        })
    }
  })
}

export function removeLabel (
  selection: Selection<SVGGElement, unknown, SVGGElement, unknown>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
