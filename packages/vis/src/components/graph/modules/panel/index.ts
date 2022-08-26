import { select, Selection } from 'd3-selection'

// Utils
import { trimText } from 'utils/text'
import { getBoolean } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Local Types
import { GraphNode, GraphLink, GraphPanelConfigInterface } from '../../types'

// Config
import { GraphConfig } from '../../config'

// Helpers
import { setLabelRect } from '../node/helper'
import { getLabelTranslateTransform, OUTLINE_SELECTION_PADDING, DEFAULT_PADDING, DEFAULT_SIDE_LABEL_SIZE } from './helper'

// Styles
import * as panelSelectors from './style'
import { appendShape, updateShape } from '../shape'

export function createPanels<N extends GraphNode, P extends GraphPanelConfigInterface> (
  selection: Selection<SVGGElement, P, SVGGElement, unknown>,
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
    .attr('class', panelSelectors.sideLabelGroup)
    .attr('transform', (d, i, elements) => {
      const dx = (d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING
      const dy = (d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING
      return `translate(${d._width + dx}, ${-dy})`
    })
  appendShape(sideLabel, (d: P) => d.sideLabelShape, panelSelectors.sideLabel, panelSelectors.customSideLabel)
  sideLabel.append('text').attr('class', panelSelectors.sideLabelIcon)
}

export function updatePanels<N extends GraphNode, L extends GraphLink, P extends GraphPanelConfigInterface> (
  selection: Selection<SVGGElement, P, SVGGElement, unknown>,
  config: GraphConfig<GraphInputNode, GraphInputLink>,
  duration: number
): void {
  const { nodeDisabled } = config
  selection
    .classed(
      panelSelectors.greyout,
      d => d._data
        .map((node, i) => getBoolean(node, nodeDisabled, node._index) || node._state.greyout)
        .every(d => d)
    )

  smartTransition(selection, duration)
    .attr('transform', d => `translate(${d._x}, ${d._y})`)
    .style('opacity', duration === 0 ? null : 1)

  const panels = selection.selectAll(`.${panelSelectors.panel}`).data(d => [d])
  smartTransition(panels, duration)
    .attr('x', d => -(d.padding || DEFAULT_PADDING))
    .attr('y', d => -(d.padding || DEFAULT_PADDING))
    .attr('width', d => d._width + (d.padding || DEFAULT_PADDING) * 2)
    .attr('height', d => d._height + (d.padding || DEFAULT_PADDING) * 2)
    .style('stroke', d => d.color)
    .style('stroke-width', d => d.borderWidth)

  const panelSelectionOutlines = selection.selectAll(`.${panelSelectors.panelSelection}`)
    .data(d => [d])
    .classed(panelSelectors.panelSelectionActive, d => d.selectionOutline)

  smartTransition(panelSelectionOutlines, duration)
    .attr('x', d => -(d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING)
    .attr('y', d => -(d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING)
    .attr('width', d => d._width + (d.padding || DEFAULT_PADDING) * 2 + OUTLINE_SELECTION_PADDING * 2)
    .attr('height', d => d._height + (d.padding || DEFAULT_PADDING) * 2 + OUTLINE_SELECTION_PADDING * 2)

  const sideLabels = selection.selectAll(`.${panelSelectors.sideLabelGroup}`)
    .data(d => [d])

  sideLabels.select<SVGGElement>(`.${panelSelectors.sideLabel}`)
    .call(updateShape, (d: P) => d.sideLabelShape, (d: P) => d.sideLabelSize ?? DEFAULT_SIDE_LABEL_SIZE)
    .style('stroke', d => d.sideLabelColor)
    .style('cursor', d => d.sideLabelCursor ?? null)
    .style('opacity', d => d.sideLabelShape ? 1 : 0)

  sideLabels.select(`.${panelSelectors.sideLabelIcon}`)
    .html(d => d.sideLabelIcon)
    .attr('dy', 1)
    .style('font-size', d => d.sideLabelIconFontSize ?? ((d.sideLabelSize ?? DEFAULT_SIDE_LABEL_SIZE) / 2.5))

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

export function removePanels<N extends GraphNode, L extends GraphLink, P extends GraphPanelConfigInterface> (
  selection: Selection<SVGGElement, P, SVGGElement, unknown>,
  config: GraphConfig<GraphInputNode, GraphInputLink>,
  duration: number
): void {
  smartTransition(selection, duration / 2)
    .style('opacity', 0)
    .remove()
}
