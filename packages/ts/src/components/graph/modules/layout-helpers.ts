// Types
import type { ElkNode } from 'elkjs/lib/elk.bundled.js'
import { GraphInputLink, GraphInputNode } from '@/types/graph'
import { GenericAccessor } from '@/types/accessor'

// Utils
import { getValue, isPlainObject, merge } from '@/utils/data'

// Local Types
import { GraphNode, GraphElkLayoutSettings } from '../types'

export const DEFAULT_ELK_SETTINGS = {
  hierarchyHandling: 'INCLUDE_CHILDREN',
  'nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.padding': '[top=15.0,left=15.0,bottom=15.0,right=15.0]',
  'spacing.nodeNodeBetweenLayers': '50',
  'spacing.edgeNodeBetweenLayers': '50',
  'spacing.nodeNode': '10',
}

export function positionNonConnectedNodes<N extends GraphInputNode, L extends GraphInputLink> (
  nodes: GraphNode<N, L>[],
  y: number,
  spacing: number,
  width: number,
  xStart = 0
): void {
  nodes.forEach((d, i) => {
    const x = spacing / 2 + i * spacing
    const rowIdx = width ? Math.floor(x / width) : 0
    d.y = (y + rowIdx * spacing) || 0
    d.x = width ? x % width + xStart : x + xStart
  })
}

export type GraphElkHierarchyNode<N extends GraphInputNode, L extends GraphInputLink> = {
  id: string;
  children: GraphNode<N, L>[] | GraphElkHierarchyNode<N, L>;
  layoutOptions: GraphElkLayoutSettings;
}

export type GraphElkHierarchyNodeMap<N extends GraphInputNode, L extends GraphInputLink>
  = Map<string | undefined | null, GraphNode<N, L>[] | GraphElkHierarchyNodeMap<N, L>>


export function toElkHierarchy<N extends GraphInputNode, L extends GraphInputLink> (
  d: GraphElkHierarchyNodeMap<N, L> | GraphNode<N, L>[],
  layoutOptions: GenericAccessor<GraphElkLayoutSettings, string> | undefined
): (GraphElkHierarchyNode<N, L> | GraphNode<N, L>)[] {
  if (!(d instanceof Map)) return d

  const hierarchyNode = Array.from(d.entries()).map(([key, value]) => {
    const children = toElkHierarchy(value, layoutOptions)
    if (key) {
      const layoutOps = isPlainObject(layoutOptions) ? merge(DEFAULT_ELK_SETTINGS, layoutOptions) : merge(DEFAULT_ELK_SETTINGS, getValue(key, layoutOptions))
      return {
        id: key,
        layoutOptions: layoutOps,
        children,
      } as GraphElkHierarchyNode<N, L>
    } else {
      return children
    }
  }).flat()

  return hierarchyNode
}

export function adjustElkHierarchyCoordinates (node: ElkNode): void {
  const parentX = node.x
  const parentY = node.y

  node.edges?.forEach(edge => {
    edge.sections?.forEach(section => {
      section.startPoint.x += parentX
      section.startPoint.y += parentY
      section.endPoint.x += parentX
      section.endPoint.y += parentY
      section.bendPoints?.forEach(bendPoint => {
        bendPoint.x += parentX
        bendPoint.y += parentY
      })
    })

    edge.labels?.forEach(label => {
      label.x += parentX
      label.y += parentY
    })
  })

  node.children?.forEach(child => {
    child.x += parentX
    child.y += parentY
    adjustElkHierarchyCoordinates(child)
  })
}
