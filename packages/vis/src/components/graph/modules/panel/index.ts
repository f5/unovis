import { select, Selection } from 'd3-selection'

// Utils
import { trimText } from 'utils/text'
import { smartTransition } from 'utils/d3'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Local Types
import { GraphNode, GraphLink, GraphPanel } from '../../types'

// Config
import { GraphConfig } from '../../config'

// Helpers
import { setLabelRect } from '../node/helper'
import { getLabelTranslateTransform, OUTLINE_SELECTION_PADDING, DEFAULT_PADDING, DEFAULT_SIDE_LABEL_SIZE } from './helper'

// Styles
import * as panelSelectors from './style'
import { appendShape, updateShape } from '../shape'

export function createPanels<N extends GraphNode, L extends GraphLink> (
  selection: Selection<SVGGElement, GraphPanel, SVGGElement, unknown>,
  nodesSelection: Selection<SVGGElement, N, SVGGElement, N>
): void {
  selection
    .attr('transform', d => `translate(${d._x}, ${d._y})`)
    .style('opacity', 0)

  selection.append('rect').attr('class', panelSelectors.panelSelection)
    .attr('rx', 9)
    .attr('ry', 9)

  selection.append('rect').attr('class', panelSelectors.panel)
    .attr('rx', 7)
    .attr('ry', 7)
    .attr('x', d => -(d.padding || DEFAULT_PADDING))
    .attr('y', d => -(d.padding || DEFAULT_PADDING))
    .attr('width', d => d._width + (d.padding || DEFAULT_PADDING) * 2)
    .attr('height', d => d._height + (d.padding || DEFAULT_PADDING) * 2)

  const label = selection.append('g').attr('class', panelSelectors.label)
    .attr('transform', getLabelTranslateTransform)
  label.append('rect').attr('class', panelSelectors.background)
  label.append('text').attr('class', panelSelectors.labelText)
    .attr('dy', '0.32em')

  const sideLabel = selection.append('g')
    .attr('class', panelSelectors.sideIconGroup)
    .attr('transform', (d, i, elements) => {
      const dx = (d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING
      const dy = (d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING
      return `translate(${d._width + dx}, ${-dy})`
    })
  appendShape(sideLabel, (d: GraphPanel) => d.sideIconShape, panelSelectors.sideIconShape, panelSelectors.customSideIcon)
  sideLabel.append('text').attr('class', panelSelectors.sideIconSymbol)
}

export function updatePanels<N extends GraphNode, L extends GraphLink> (
  selection: Selection<SVGGElement, GraphPanel, SVGGElement, unknown>,
  config: GraphConfig<GraphInputNode, GraphInputLink>,
  duration: number
): void {
  smartTransition(selection, duration)
    .attr('transform', d => `translate(${d._x}, ${d._y})`)
    .style('opacity', d => d._disabled ? 0.4 : 1)

  const panels = selection.selectAll(`.${panelSelectors.panel}`).data(d => [d])
  smartTransition(panels, duration)
    .attr('x', d => -(d.padding || DEFAULT_PADDING))
    .attr('y', d => -(d.padding || DEFAULT_PADDING))
    .attr('width', d => d._width + (d.padding || DEFAULT_PADDING) * 2)
    .attr('height', d => d._height + (d.padding || DEFAULT_PADDING) * 2)
    .style('stroke', d => d.borderColor)
    .style('stroke-width', d => d.borderWidth)

  const panelSelectionOutlines = selection.selectAll(`.${panelSelectors.panelSelection}`)
    .data(d => [d])
    .classed(panelSelectors.panelSelectionActive, d => d.dashedOutline)

  smartTransition(panelSelectionOutlines, duration)
    .attr('x', d => -(d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING)
    .attr('y', d => -(d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING)
    .attr('width', d => d._width + (d.padding || DEFAULT_PADDING) * 2 + OUTLINE_SELECTION_PADDING * 2)
    .attr('height', d => d._height + (d.padding || DEFAULT_PADDING) * 2 + OUTLINE_SELECTION_PADDING * 2)

  const sideLabels = selection.selectAll(`.${panelSelectors.sideIconGroup}`)
    .data(d => [d])

  sideLabels.select<SVGGElement>(`.${panelSelectors.sideIconShape}`)
    .call(updateShape, (d: GraphPanel) => d.sideIconShape, (d: GraphPanel) => d.sideIconShapeSize ?? DEFAULT_SIDE_LABEL_SIZE)
    .style('stroke', d => d.sideIconShapeStroke)
    .style('cursor', d => d.sideIconCursor ?? null)
    .style('opacity', d => d.sideIconShape ? 1 : 0)

  sideLabels.select(`.${panelSelectors.sideIconSymbol}`)
    .html(d => d.sideIconSymbol)
    .attr('dy', 1)
    .style('fill', d => d.sideIconSymbolColor)
    .style('font-size', d => d.sideIconFontSize ?? ((d.sideIconShapeSize ?? DEFAULT_SIDE_LABEL_SIZE) / 2.5))

  smartTransition(sideLabels, duration)
    .attr('transform', (d, i, elements) => {
      const dx = (d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING
      const dy = (d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING
      return `translate(${d._width + dx}, ${-dy})`
    })

  const labels = selection.selectAll(`.${panelSelectors.label}`)
    .data(d => [d])

  labels.select(`.${panelSelectors.labelText}`)
    .text(d => trimText(d.label))

  smartTransition(labels, duration)
    .attr('transform', getLabelTranslateTransform)

  labels
    .on('mouseover', (event: MouseEvent, d) => {
      const label = select(event.currentTarget as SVGTextElement)
      const labelContent = d.label
      label.select('text').text(labelContent)
      setLabelRect(label, labelContent, panelSelectors.labelText)
    })
    .on('mouseleave', (event: MouseEvent, d) => {
      const label = select(event.currentTarget as SVGTextElement)
      const labelContent = trimText(d.label)
      label.select('text').text(labelContent)
      setLabelRect(label, labelContent, panelSelectors.labelText)
    })
}

export function removePanels<N extends GraphNode, L extends GraphLink> (
  selection: Selection<SVGGElement, GraphPanel, SVGGElement, unknown>,
  config: GraphConfig<GraphInputNode, GraphInputLink>,
  duration: number
): void {
  smartTransition(selection, duration / 2)
    .style('opacity', 0)
    .remove()
}
