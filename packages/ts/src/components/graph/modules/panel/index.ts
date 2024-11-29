import { select, Selection } from 'd3-selection'

// Utils
import { trimString } from '@/utils/text'
import { smartTransition } from '@/utils/d3'

// Types
import { GraphInputLink, GraphInputNode } from '@/types/graph'

// Local Types
import { GraphNode, GraphLink, GraphPanel } from '../../types'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import { setLabelRect } from '../node/helper'
import { getLabelTranslateTransform, OUTLINE_SELECTION_PADDING, DEFAULT_SIDE_LABEL_SIZE } from './helper'

// Styles
import * as panelSelectors from './style'
import { appendShape, updateShape } from '../shape'

export function createPanels<N extends GraphNode, L extends GraphLink> (
  selection: Selection<SVGGElement, GraphPanel, SVGGElement, unknown>
): void {
  selection
    .attr('transform', d => `translate(${d._x}, ${d._y})`)
    .style('opacity', 0)

  selection.append('rect').attr('class', panelSelectors.panelSelection)
    .attr('rx', 9)
    .attr('ry', 9)
    .attr('width', d => d._width)
    .attr('height', d => d._height)

  selection.append('rect').attr('class', panelSelectors.panel)
    .attr('rx', 7)
    .attr('ry', 7)
    .attr('width', d => d._width)
    .attr('height', d => d._height)

  const panelLabel = selection.append('g').attr('class', panelSelectors.label)
    .attr('transform', getLabelTranslateTransform)
  panelLabel.append('rect').attr('class', panelSelectors.background)
  panelLabel.append('text').attr('class', panelSelectors.labelText)
    .attr('dy', '0.32em')

  const sideIcon = selection.append('g')
    .attr('class', panelSelectors.sideIconGroup)
    .attr('transform', (d, i, elements) => {
      const dx = -OUTLINE_SELECTION_PADDING
      const dy = -OUTLINE_SELECTION_PADDING
      return `translate(${d._width + dx}, ${-dy})`
    })
  appendShape(sideIcon, (d: GraphPanel) => d.sideIconShape, panelSelectors.sideIconShape, panelSelectors.customSideIcon)
  sideIcon.append('text').attr('class', panelSelectors.sideIconSymbol)
}

export function updatePanels<N extends GraphNode, L extends GraphLink> (
  selection: Selection<SVGGElement, GraphPanel, SVGGElement, unknown>,
  config: GraphConfigInterface<GraphInputNode, GraphInputLink>,
  duration: number
): void {
  smartTransition(selection, duration)
    .attr('transform', d => `translate(${d._x}, ${d._y})`)
    .style('opacity', d => d._disabled ? 0.4 : 1)

  const panels = selection.selectAll<SVGRectElement, GraphPanel>(`.${panelSelectors.panel}`).data(d => [d])
  smartTransition(panels, duration)
    .attr('width', d => d._width)
    .attr('height', d => d._height)
    .style('stroke', d => d.borderColor)
    .style('fill', d => d.fillColor)
    .style('stroke-width', d => d.borderWidth)

  const panelSelection = selection.select<SVGRectElement>(`.${panelSelectors.panelSelection}`)
    .classed(panelSelectors.panelSelectionActive, d => d.dashedOutline)

  smartTransition(panelSelection, duration)
    .attr('x', d => -OUTLINE_SELECTION_PADDING)
    .attr('y', d => -OUTLINE_SELECTION_PADDING)
    .attr('width', d => d._width + OUTLINE_SELECTION_PADDING * 2)
    .attr('height', d => d._height + OUTLINE_SELECTION_PADDING * 2)

  const sideIcon = selection.select<SVGGElement>(`.${panelSelectors.sideIconGroup}`)

  sideIcon.select<SVGGElement>(`.${panelSelectors.sideIconShape}`)
    .call(updateShape, (d: GraphPanel) => d.sideIconShape, (d: GraphPanel) => d.sideIconShapeSize ?? DEFAULT_SIDE_LABEL_SIZE)
    .style('stroke', d => d.sideIconShapeStroke)
    .style('cursor', d => d.sideIconCursor ?? null)
    .style('opacity', d => d.sideIconShape ? 1 : 0)

  sideIcon.select(`.${panelSelectors.sideIconSymbol}`)
    .html(d => d.sideIconSymbol)
    .attr('dy', 1)
    .style('fill', d => d.sideIconSymbolColor)
    .style('font-size', d => d.sideIconFontSize ?? ((d.sideIconShapeSize ?? DEFAULT_SIDE_LABEL_SIZE) / 2.5))

  smartTransition(sideIcon, duration)
    .attr('transform', d => {
      const dx = -OUTLINE_SELECTION_PADDING
      const dy = -OUTLINE_SELECTION_PADDING
      return `translate(${d._width + dx}, ${-dy})`
    })

  const panelLabel = selection.select<SVGGElement>(`.${panelSelectors.label}`)

  panelLabel.select<SVGTextElement>(`.${panelSelectors.labelText}`)
    .text(d => trimString(d.label, d.labelTrimLength, d.labelTrimMode))

  smartTransition(panelLabel, duration)
    .attr('transform', getLabelTranslateTransform)

  panelLabel
    .on('mouseover', (event: MouseEvent, d) => {
      const label = select<SVGGElement, GraphPanel<N, L>>(event.currentTarget as SVGGElement)
      const labelContent = d.label
      label.select('text').text(labelContent)
      setLabelRect(label, labelContent, panelSelectors.labelText)
    })
    .on('mouseleave', (event: MouseEvent, d) => {
      const label = select<SVGGElement, GraphPanel<N, L>>(event.currentTarget as SVGGElement)
      const labelContent = trimString(d.label, d.labelTrimLength, d.labelTrimMode)
      label.select('text').text(labelContent)
      setLabelRect(label, labelContent, panelSelectors.labelText)
    })
}

export function removePanels<N extends GraphNode, L extends GraphLink> (
  selection: Selection<SVGGElement, GraphPanel, SVGGElement, unknown>,
  config: GraphConfigInterface<GraphInputNode, GraphInputLink>,
  duration: number
): void {
  smartTransition(selection, duration / 2)
    .style('opacity', 0)
    .remove()
}
