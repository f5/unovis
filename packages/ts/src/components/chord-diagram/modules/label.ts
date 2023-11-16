import { select, Selection } from 'd3-selection'
import { ScaleContinuousNumeric } from 'd3-scale'
import { color } from 'd3-color'

// Utils
import { trimSVGText } from 'utils/text'
import { smartTransition } from 'utils/d3'
import { getNumber, getString, getValue } from 'utils/data'
import { getColor, hexToBrightness } from 'utils/color'

// Config
import { ChordDiagramConfigInterface } from '../config'

// Local Types
import { ChordInputLink, ChordInputNode, ChordLabelAlignment, ChordNode } from '../types'

// Styles
import * as s from '../style'

export const LABEL_PADDING = 3

function getLabelFillColor<N extends ChordInputNode, L extends ChordInputLink> (
  d: ChordNode<N>,
  config: ChordDiagramConfigInterface<N, L>
): string {
  const nodeLabelAlignment = getValue(d.data, config.nodeLabelAlignment) ?? ChordLabelAlignment.Along
  switch (nodeLabelAlignment) {
    case ChordLabelAlignment.Perpendicular: {
      return getColor(d.data, config.nodeColor, d.height)
    }
    case ChordLabelAlignment.Along: {
      const c = getColor(d.data, config.nodeColor, d.height)
      const colorParsed = color(c)
      const brightness = colorParsed ? hexToBrightness(colorParsed.hex()) : 0
      return brightness > 0.65 ? 'var(--vis-chord-diagram-label-text-fill-color-dark)' : 'var(--vis-chord-diagram-label-text-fill-color-bright)'
    }
  }
}

function getLabelTextAnchor<N extends ChordInputNode, L extends ChordInputLink> (
  d: ChordNode<N>,
  config: ChordDiagramConfigInterface<N, L>
): string | null {
  const nodeLabelAlignment = getValue(d.data, config.nodeLabelAlignment) ?? ChordLabelAlignment.Along
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
  config: ChordDiagramConfigInterface<N, L>,
  radiusScale: ScaleContinuousNumeric<number, number>
): string | null {
  const nodeLabelAlignment = getValue(d.data, config.nodeLabelAlignment) ?? ChordLabelAlignment.Along
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
  config: ChordDiagramConfigInterface<N, L>,
  radiusScale: ScaleContinuousNumeric<number, number>
): void {
  selection.style('opacity', 0)
    .attr('transform', d => getLabelTransform(d, config, radiusScale))

  selection.append('text')
    .attr('class', s.labelText)
    .style('fill', d => getColor(d.data, config.nodeColor, d.height))
}

export function updateLabel<N extends ChordInputNode, L extends ChordInputLink> (
  selection: Selection<SVGGElement, ChordNode<N>, SVGGElement, unknown>,
  config: ChordDiagramConfigInterface<N, L>,
  width: number,
  radiusScale: ScaleContinuousNumeric<number, number>,
  duration: number
): void {
  const { nodeLabel, nodeLabelColor, nodeWidth } = config

  smartTransition(selection, duration)
    .attr('transform', d => getLabelTransform(d, config, radiusScale))
    .style('opacity', 1)

  const label: Selection<SVGTextElement, ChordNode<N>, SVGElement, unknown> = selection.select(`.${s.labelText}`)
  label.select('textPath').remove()
  label
    .text(d => getString(d.data, nodeLabel))
    .style('fill', d => getColor(d.data, nodeLabelColor) ?? getLabelFillColor(d, config))
    .style('text-anchor', d => getLabelTextAnchor(d, config))

  label.each((d: ChordNode<N>, i: number, elements) => {
    const nodeLabelAlignment = getValue(d.data, config.nodeLabelAlignment) ?? ChordLabelAlignment.Along
    const radianArcLength = d.x1 - d.x0 - getNumber(d.data, config.padAngle) * 2
    const radius = radiusScale(d.y1) - getNumber(d, config.nodeWidth) / 2
    const arcLength = radius * radianArcLength
    const maxWidth = (nodeLabelAlignment === ChordLabelAlignment.Along ? arcLength : width) - LABEL_PADDING * 2

    const textElementSelection = select(elements[i])
    trimSVGText(textElementSelection, maxWidth)
    textElementSelection
      .attr('dx', nodeLabelAlignment === ChordLabelAlignment.Along ? LABEL_PADDING : null)
      .attr('dy', nodeLabelAlignment === ChordLabelAlignment.Along ? getNumber(d.data, nodeWidth) / 2 : null)

    if (nodeLabelAlignment === ChordLabelAlignment.Along) {
      const textElement = select(elements[i])
      const textWidth = textElement.node().getBoundingClientRect().width
      const labelText = textElement.text()

      select(elements[i])
        .text('')
        .style('display', textWidth > maxWidth && 'none')

      select(elements[i]).append('textPath')
        .attr('href', `#${d.uid}`)
        .text(labelText)
    }
  })

  smartTransition(label, duration)
    .attr('transform', d => {
      const nodeLabelAlignment = getValue(d.data, config.nodeLabelAlignment)
      if (nodeLabelAlignment !== ChordLabelAlignment.Perpendicular) return null
      const angleCenter = (d.x0 + d.x1) / 2
      const angleDegree = angleCenter * 180 / Math.PI
      return `rotate(${angleDegree < 180 ? angleDegree - 90 : angleDegree + 90})`
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
