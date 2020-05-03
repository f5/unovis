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

// Styles
import * as panelSelectors from './style'
import { appendShape, updateShape } from '../shape'

const OUTLINE_SELECTION_PADDING = 5

export function createPanels<N extends NodeDatumCore, P extends PanelConfigInterface> (selection: Selection<SVGGElement, P, SVGGElement, P[]>, nodesSelection: Selection<SVGGElement, N, SVGGElement, N[]>): void {
  selection.style('opacity', 0)

  selection.append('rect').attr('class', panelSelectors.panelSelection)
    .attr('rx', 9)
    .attr('ry', 9)

  selection.append('rect').attr('class', panelSelectors.panel)
    .attr('rx', 7)
    .attr('ry', 7)

  const label = selection.append('g').attr('class', panelSelectors.label)
  label.append('rect').attr('class', panelSelectors.background)
  label.append('text').attr('class', panelSelectors.labelText)
    .attr('dy', '0.32em')

  const sideLabel = selection.append('g')
    .attr('class', panelSelectors.sideLabelGroup)
  sideLabel.call(appendShape, (d: P) => d.sideLabelShape, panelSelectors.sideLabel, panelSelectors.customSideLabel)
  sideLabel.append('text').attr('class', panelSelectors.sideLabelIcon)

  selection.on('mouseover', (d, i, els) => {
    if (nodesSelection) {
      nodesSelection.sort((a, b) => {
        const aIndex = d.nodes.indexOf(a.id)
        const bIndex = d.nodes.indexOf(b.id)
        return (bIndex === -1 ? 1 : 0) - (aIndex === -1 ? 1 : 0)
      })
    }
    const group = select(els[i])
    group.raise()
  })
}

export function updatePanels<N extends NodeDatumCore, L extends LinkDatumCore, P extends PanelConfigInterface> (selection: Selection<SVGGElement, P, SVGGElement, P[]>, config: GraphConfigInterface<N, L>, duration: number): void {
  const { nodeDisabled } = config
  const groupPadding = 15

  selection.attr('transform', d => `translate(${d._x}, ${d._y})`)
  selection.classed(panelSelectors.greyout, d => d._data.map(node => getValue(node, nodeDisabled) || node._state.greyout).every(d => d))

  selection.selectAll(`.${panelSelectors.panel}`)
    .data(d => [d])
    .attr('x', d => -(d.padding || groupPadding))
    .attr('y', d => -(d.padding || groupPadding))
    .attr('width', d => d._width + (d.padding || groupPadding) * 2)
    .attr('height', d => d._height + (d.padding || groupPadding) * 2)
    .style('stroke-width', d => d.borderWidth)

  selection.selectAll(`.${panelSelectors.panelSelection}`)
    .data(d => [d])
    .classed(panelSelectors.panelSelectionActive, d => d.selectionOutline)
    .attr('x', d => -(d.padding || groupPadding) - OUTLINE_SELECTION_PADDING)
    .attr('y', d => -(d.padding || groupPadding) - OUTLINE_SELECTION_PADDING)
    .attr('width', d => d._width + (d.padding || groupPadding) * 2 + OUTLINE_SELECTION_PADDING * 2)
    .attr('height', d => d._height + (d.padding || groupPadding) * 2 + OUTLINE_SELECTION_PADDING * 2)

  smartTransition(selection, duration / 2)
    .style('opacity', duration === 0 ? null : 1)
    .style('stroke', (d: P) => d.color)

  const sideLabelSize = 25
  const sideLabels = selection.selectAll(`.${panelSelectors.sideLabelGroup}`)
    .data(d => [d])

  sideLabels.select(`.${panelSelectors.sideLabel}`)
    .call(updateShape, (d: P) => d.sideLabelShape, sideLabelSize)
    .style('stroke', d => d.sideLabelColor)

  sideLabels.select(`.${panelSelectors.sideLabelIcon}`)
    .html(d => d.sideLabelIcon)
    .attr('dy', 1)

  sideLabels
    .attr('transform', (d, i, elements) => {
      const dx = (d.padding || groupPadding) - OUTLINE_SELECTION_PADDING
      const dy = (d.padding || groupPadding) - OUTLINE_SELECTION_PADDING
      return `translate(${d._width + dx}, ${-dy})`
    })

  const labelMargin = 16
  const labels = selection.selectAll(`.${panelSelectors.label}`)
    .data(d => [d])

  labels.select(`.${panelSelectors.labelText}`)
    .text(d => trimText(d.label))
    .style('fill', d => d.color)

  labels.attr('transform', d => `translate(${d._width / 2}, ${-(d.padding || groupPadding) - labelMargin - (d.selectionOutline ? OUTLINE_SELECTION_PADDING : 0)})`)
  labels
    .on('mouseover', (d, i, els) => {
      const label = select(els[i])
      const labelContent = d.label
      label.select('text').text(labelContent)
      setLabelRect(label, labelContent, panelSelectors.labelText)
    })
    .on('mouseleave', (d, i, els) => {
      const label = select(els[i])
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
