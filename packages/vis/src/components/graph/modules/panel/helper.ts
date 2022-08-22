import { Selection, BaseType } from 'd3-selection'
import { max } from 'd3-array'

// Types
import { NumericAccessor } from 'types/accessor'
import { Position } from 'types/position'
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Utils
import { find } from 'utils/data'

// Local Types
import { GraphNode, GraphPanelConfigInterface } from '../../types'

// Config
import { GraphConfig } from '../../config'

// Helpers
import { getX, getY, getNodeSize } from '../node/helper'

// Styles
import * as nodeSelectors from '../node/style'

export const DEFAULT_PADDING = 15
export const DEFAULT_LABEL_MARGIN = 16
export const OUTLINE_SELECTION_PADDING = 5
export const DEFAULT_SIDE_LABEL_SIZE = 25

export function setPanelForNodes<N extends GraphInputNode, L extends GraphInputLink> (
  panels: GraphPanelConfigInterface[], nodes: GraphNode<N, L>[],
  config: GraphConfig<N, L>
): void {
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
        const panelNodes = panel.nodes.map((panelNodeId): GraphNode<N, L> => find(nodes, (n: GraphNode<N, L>) => panelNodeId === n._id))
        return layoutNonConnectedAside ? panelNodes.filter((n: GraphNode<N, L>) => n._isConnected) : panelNodes
      })
    }
  })
}

export function setPanelBBox<N extends GraphInputNode, L extends GraphInputLink> (
  panelConfig: GraphPanelConfigInterface,
  panelNodes: Selection<BaseType, GraphNode<N, L>, SVGGElement, GraphNode<N, L>>,
  nodeSizeAccessor: NumericAccessor<N>
): void {
  const selection = panelNodes.select(`.${nodeSelectors.node}`)
  if (selection.empty()) return

  const labelApprxHeight = 40
  const labelApprxWidth = 110
  const labelMargin = 10
  let box: { x1: number; x2: number; y1: number; y2: number }

  selection.each((d, i) => {
    const nodeSize = getNodeSize(d, nodeSizeAccessor, i)
    const w = Math.max(nodeSize, labelApprxWidth)
    const h = nodeSize + labelMargin + labelApprxHeight
    // const nodeBBox = node.getBBox()
    const yShift = 10 // This is hard to calculate so we just using an approximation

    const coords = {
      x1: getX(d) - w / 2 - DEFAULT_PADDING, // We use d.x and d.y instead of bBox values here because gBBox contains initial ...
      y1: getY(d) - h / 2 + yShift - DEFAULT_PADDING, // ... coordinates (before transition starts), not target coordinates
      x2: getX(d) + w / 2 + DEFAULT_PADDING,
      y2: getY(d) + h / 2 + yShift + DEFAULT_PADDING,
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
}

export function setPanelNumNodes<N extends GraphInputNode, L extends GraphInputLink> (
  panelConfig: GraphPanelConfigInterface,
  panelNodes: Selection<BaseType, GraphNode<N, L>, SVGGElement, GraphNode<N, L>>
): void {
  panelConfig._numNodes = panelNodes.size()
}

export function updatePanelBBoxSize<N extends GraphInputNode, L extends GraphInputLink> (
  nodesSelection: Selection<BaseType, GraphNode<N, L>, SVGGElement, GraphNode<N, L>>,
  panels: GraphPanelConfigInterface[],
  config: GraphConfig<N, L>
): void {
  const { layoutNonConnectedAside } = config
  if (!panels) return

  panels.forEach(panelConfig => {
    const panelNodes = nodesSelection.filter(node => {
      return (!layoutNonConnectedAside || node._isConnected) && panelConfig.nodes.includes(node._id)
    })
    setPanelBBox(panelConfig, panelNodes, config.nodeSize)
  })
}

export function updatePanelNumNodes<N extends GraphInputNode, L extends GraphInputLink> (
  nodesSelection: Selection<BaseType, GraphNode<N, L>, SVGGElement, GraphNode<N, L>>,
  panels: GraphPanelConfigInterface[],
  config: GraphConfig<N, L>
): void {
  const { layoutNonConnectedAside } = config
  if (!panels) return

  panels.forEach(panelConfig => {
    const panelNodes = nodesSelection.filter(node => {
      return (!layoutNonConnectedAside || node._isConnected) && panelConfig.nodes.includes(node._id)
    })
    setPanelNumNodes(panelConfig, panelNodes)
  })
}

export function getMaxPanelPadding<P extends GraphPanelConfigInterface> (panels: P[]): number {
  return panels?.length ? DEFAULT_PADDING + max(panels.map(d => d.padding)) : 0
}

export function getLabelTranslateTransform<P extends GraphPanelConfigInterface> (panel: P): string {
  const x = panel._width / 2
  const dy = (panel.padding ?? DEFAULT_PADDING) + DEFAULT_LABEL_MARGIN + (panel.selectionOutline ? OUTLINE_SELECTION_PADDING : 0)
  const y = panel.labelPosition === Position.Bottom
    ? panel._height + dy
    : -dy

  return `translate(${x}, ${y})`
}
