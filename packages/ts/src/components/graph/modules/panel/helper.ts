import { Selection } from 'd3-selection'

// Types
import { NumericAccessor, BooleanAccessor } from '@/types/accessor'
import { Position } from '@/types/position'
import { GraphInputLink, GraphInputNode } from '@/types/graph'
import { Spacing } from '@/types/spacing'

// Utils
import { getBoolean, isPlainObject } from '@/utils/data'

// Local Types
import { GraphNode, GraphPanel, GraphPanelConfig } from '../../types'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import { getX, getY, getNodeSize } from '../node/helper'

// Styles
import * as nodeSelectors from '../node/style'

export const DEFAULT_PADDING = 15
export const DEFAULT_LABEL_MARGIN = 16
export const OUTLINE_SELECTION_PADDING = 5
export const DEFAULT_SIDE_LABEL_SIZE = 25

export function getPanelPadding (padding: number | Spacing | undefined): Spacing {
  const isPaddingAnObject = isPlainObject(padding)
  return {
    left: (isPaddingAnObject ? (padding as Spacing).left : (padding as number)) ?? DEFAULT_PADDING,
    right: (isPaddingAnObject ? (padding as Spacing).right : (padding as number)) ?? DEFAULT_PADDING,
    top: (isPaddingAnObject ? (padding as Spacing).top : (padding as number)) ?? DEFAULT_PADDING,
    bottom: (isPaddingAnObject ? (padding as Spacing).bottom : (padding as number)) ?? DEFAULT_PADDING,
  }
}

export function initPanels (panelsConfig: GraphPanelConfig[] | undefined): GraphPanel[] {
  const panels = (panelsConfig ?? []).map(p => ({
    ...p,
    _padding: getPanelPadding(p.padding),
  })) as GraphPanel[]

  return panels
}

export function setPanelForNodes<N extends GraphInputNode, L extends GraphInputLink> (
  panels: GraphPanel[],
  nodes: GraphNode<N, L>[],
  config: GraphConfigInterface<N, L>
): void {
  if (!panels) return

  // For each node store its related panels
  nodes.forEach(node => {
    // Find all panels to which node belong
    const nodePanels = panels.filter(panel => panel.nodes && panel.nodes.includes(node._id))
    node._panels = nodePanels
  })
}

export function setPanelBBox<N extends GraphInputNode, L extends GraphInputLink> (
  panelConfig: GraphPanel,
  panelNodes: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
  nodeSizeAccessor: NumericAccessor<N>,
  nodeDisabledAccessor: BooleanAccessor<N>
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
    const yShift = 10 // This is hard to calculate, so we just use an approximation

    const coords = {
      x1: getX(d) - w / 2, // We use d.x and d.y instead of bBox values here because `gBBox` contains initial ...
      y1: getY(d) - h / 2 + yShift, // ... coordinates (before transition starts), not target coordinates
      x2: getX(d) + w / 2,
      y2: getY(d) + h / 2 + yShift,
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

  panelConfig._x = box.x1 - panelConfig._padding.left
  panelConfig._y = box.y1 - panelConfig._padding.top
  panelConfig._width = box.x2 - box.x1 + panelConfig._padding.left + panelConfig._padding.right
  panelConfig._height = box.y2 - box.y1 + panelConfig._padding.top + panelConfig._padding.bottom
  panelConfig._disabled = selection.data()
    .map((node, i) => getBoolean(node, nodeDisabledAccessor, node._index) || node._state.greyout)
    .every(d => d)
}

export function setPanelNumNodes<N extends GraphInputNode, L extends GraphInputLink> (
  panelConfig: GraphPanel,
  panelNodes: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>
): void {
  panelConfig._numNodes = panelNodes.size()
}

export function updatePanelBBoxSize<N extends GraphInputNode, L extends GraphInputLink> (
  nodesSelection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
  panels: GraphPanel[],
  config: GraphConfigInterface<N, L>
): void {
  const { layoutNonConnectedAside } = config
  if (!panels) return

  panels.forEach(panelConfig => {
    const panelNodes = nodesSelection.filter(node => {
      return (!layoutNonConnectedAside || node._isConnected) && panelConfig.nodes.includes(node._id)
    })
    setPanelBBox(panelConfig, panelNodes, config.nodeSize, config.nodeDisabled)
  })
}

export function updatePanelNumNodes<N extends GraphInputNode, L extends GraphInputLink> (
  nodesSelection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
  panels: GraphPanel[],
  config: GraphConfigInterface<N, L>
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

export function getLabelTranslateTransform<N extends GraphInputNode, L extends GraphInputLink> (panel: GraphPanel): string {
  const x = panel._width / 2
  const dy = DEFAULT_LABEL_MARGIN + (panel.dashedOutline ? OUTLINE_SELECTION_PADDING : 0)
  const y = panel.labelPosition === Position.Bottom
    ? panel._height + dy
    : -dy

  return `translate(${x}, ${y})`
}
