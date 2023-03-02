// Types
import type { ElkNode } from 'elkjs/lib/elk.bundled.js'
import { GraphInputLink, GraphInputNode } from 'types/graph'
import { GenericAccessor } from 'types/accessor'

// Utils
import { getValue } from 'utils/data'

// Local Types
import { GraphNode } from '../types'

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
  layoutOptions: GraphElkLayoutOptions;
}

export type GraphElkHierarchyNodeMap<N extends GraphInputNode, L extends GraphInputLink>
  = Map<string | undefined | null, GraphNode<N, L>[] | GraphElkHierarchyNodeMap<N, L>>

export type GraphElkLayoutOptions = Record<string, string>

export function toElkHierarchy<N extends GraphInputNode, L extends GraphInputLink> (
  d: GraphElkHierarchyNodeMap<N, L> | GraphNode<N, L>[],
  layoutOptions: GenericAccessor<GraphElkLayoutOptions, string> | undefined
): (GraphElkHierarchyNode<N, L> | GraphNode<N, L>)[] {
  if (!(d instanceof Map)) return d

  const hierarchyNode = Array.from(d.entries()).map(([key, value]) => {
    const children = toElkHierarchy(value, layoutOptions)
    if (key) {
      const layoutOps = getValue(key, layoutOptions)

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
