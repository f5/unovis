// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'

// Type
import { NodeDatumCore, LinkDatumCore, PanelConfigInterface } from 'types/graph'

// Utils
import { trimText } from 'utils/text'
import { getValue } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import { setLabelRect } from '../node/helper'
import { getLabelTranslateTransform, OUTLINE_SELECTION_PADDING, DEFAULT_PADDING } from './helper'

// Styles
import * as panelSelectors from './style'
import { appendShape, updateShape } from '../shape'

export function createPanels<N extends NodeDatumCore, P extends PanelConfigInterface> (selection: Selection<SVGGElement, P, SVGGElement, P[]>, nodesSelection: Selection<SVGGElement, N, SVGGElement, N[]>): void {
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
  sideLabel.call(appendShape, (d: P) => d.sideLabelShape, panelSelectors.sideLabel, panelSelectors.customSideLabel)
  sideLabel.append('text').attr('class', panelSelectors.sideLabelIcon)
}

export function updatePanels<N extends NodeDatumCore, L extends LinkDatumCore, P extends PanelConfigInterface> (selection: Selection<SVGGElement, P, SVGGElement, P[]>, config: GraphConfigInterface<N, L>, duration: number): void {
  const { nodeDisabled } = config
  selection.classed(panelSelectors.greyout, d => d._data.map(node => getValue(node, nodeDisabled) || node._state.greyout).every(d => d))

  smartTransition(selection, duration)
    .attr('transform', d => `translate(${d._x}, ${d._y})`)
    .style('opacity', duration === 0 ? null : 1)
    .style('stroke', (d: P) => d.color)

  const panels = selection.selectAll(`.${panelSelectors.panel}`).data(d => [d])
  smartTransition(panels, duration)
    .attr('x', d => -(d.padding || DEFAULT_PADDING))
    .attr('y', d => -(d.padding || DEFAULT_PADDING))
    .attr('width', d => d._width + (d.padding || DEFAULT_PADDING) * 2)
    .attr('height', d => d._height + (d.padding || DEFAULT_PADDING) * 2)
    .style('stroke-width', d => d.borderWidth)

  const panelSelectionOutlines = selection.selectAll(`.${panelSelectors.panelSelection}`)
    .data(d => [d])
    .classed(panelSelectors.panelSelectionActive, d => d.selectionOutline)

  smartTransition(panelSelectionOutlines, duration)
    .attr('x', d => -(d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING)
    .attr('y', d => -(d.padding || DEFAULT_PADDING) - OUTLINE_SELECTION_PADDING)
    .attr('width', d => d._width + (d.padding || DEFAULT_PADDING) * 2 + OUTLINE_SELECTION_PADDING * 2)
    .attr('height', d => d._height + (d.padding || DEFAULT_PADDING) * 2 + OUTLINE_SELECTION_PADDING * 2)

  const sideLabelSize = 25
  const sideLabels = selection.selectAll(`.${panelSelectors.sideLabelGroup}`)
    .data(d => [d])

  sideLabels.select(`.${panelSelectors.sideLabel}`)
    .call(updateShape, (d: P) => d.sideLabelShape, sideLabelSize)
    .style('stroke', d => d.sideLabelColor)
    .style('cursor', d => d.sideLabelCursor ?? null)
    .style('opacity', d => d.sideLabelShape ? 1 : 0)

  sideLabels.select(`.${panelSelectors.sideLabelIcon}`)
    .html(d => d.sideLabelIcon)
    .attr('dy', 1)

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

export function removePanels<N extends NodeDatumCore, L extends LinkDatumCore, P extends PanelConfigInterface> (selection: Selection<SVGGElement, P, SVGGElement, P[]>, config: GraphConfigInterface<N, L>, duration: number): void {
  smartTransition(selection, duration / 2)
    .style('opacity', 0)
    .remove()
}
