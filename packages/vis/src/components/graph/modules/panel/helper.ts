// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection, BaseType } from 'd3-selection'
import { max } from 'd3-array'

// Type
import { NodeDatumCore, LinkDatumCore, PanelConfigInterface } from 'types/graph'

// Utils
import { find } from 'utils/data'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import { getX, getY } from '../node/helper'

// Styles
import * as nodeSelectors from '../node/style'

const DEFAULT_PADDING = 25

export function setPanelForNodes<N extends NodeDatumCore, L extends LinkDatumCore> (panels: PanelConfigInterface[], nodes: N[], config: GraphConfigInterface<N, L>): void {
  const { layoutNonConnectedAside } = config
  if (!panels) return

  // For each Node create Panels to which node belongs
  // Then for each Panel create an array of neighbouring Nodes
  nodes.forEach(node => {
    // Find all panels to which node is belong
    const nodePanels = panels.filter(panel => panel.nodes && panel.nodes.includes(node._id))
    if (!layoutNonConnectedAside || node._isConnected) {
      // Find and put neighbour Nodes to each panel
      node._panels = nodePanels.map(panel => {
        const panelNodes = panel.nodes.map((panelNodeId): N => find(nodes, (n: N) => panelNodeId === n._id))
        return layoutNonConnectedAside ? panelNodes.filter((n: N) => n._isConnected) : panelNodes
      })
    }
  })
}

export function setPanelBBox<N extends NodeDatumCore> (panelConfig: PanelConfigInterface, panelNodes: Selection<BaseType, N, SVGGElement, N[]>): void {
  const selection = panelNodes.select(`.${nodeSelectors.node}`)
  if (selection.empty()) return

  let box
  selection.each((d, i, elements) => {
    const g = elements[i]
    // const node = g.querySelector('.node')
    const gBBox = (g as SVGSVGElement).getBBox()
    // const nodeBBox = node.getBBox()
    const yShift = 10 // This is hard to calculate so we just using an approximation

    const coords = {
      x1: getX(d) - gBBox.width / 2 - DEFAULT_PADDING, // We use d.x and d.y instead of bBox values here becasue gBBox contains initial ...
      y1: getY(d) - gBBox.height / 2 + yShift - DEFAULT_PADDING, // ... coordinates (before transition starts), not target coordinates
      x2: getX(d) + gBBox.width / 2 + DEFAULT_PADDING,
      y2: getY(d) + gBBox.height / 2 + yShift + DEFAULT_PADDING,
    }

    if (!box) {
      box = {
        ...coords,
      }
    } else {
      if (box.x1 > coords.x1) box.x1 = coords.x1
      if (box.y1 > coords.y1) box.y1 = coords.y1
      if (box.x2 < coords.x2) box.x2 = coords.x2
      if (box.y2 < coords.y2) box.y2 = coords.y2
    }
  })

  panelConfig._x = box.x1
  panelConfig._y = box.y1
  panelConfig._width = box.x2 - box.x1
  panelConfig._height = box.y2 - box.y1
  panelConfig._data = selection.data()
  panelConfig._numNodes = panelNodes.size()
}

export function updatePanelData<N extends NodeDatumCore, L extends LinkDatumCore> (nodesSelection: Selection<BaseType, N, SVGGElement, N[]>, panels: PanelConfigInterface[], config: GraphConfigInterface<N, L>): void {
  const { layoutNonConnectedAside } = config
  if (!panels) return

  panels.forEach(panelConfig => {
    const panelNodes = nodesSelection.filter(node => {
      return (!layoutNonConnectedAside || node._isConnected) && panelConfig.nodes.includes(node._id)
    })
    setPanelBBox(panelConfig, panelNodes)
  })
}

export function getMaxPanlePadding<P extends PanelConfigInterface> (panels: P[]): number {
  return panels?.length ? DEFAULT_PADDING + max(panels.map(d => d.padding)) : 0
}
