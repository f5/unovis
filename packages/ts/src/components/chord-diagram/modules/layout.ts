import { group, index } from 'd3-array'
import { HierarchyNode, hierarchy } from 'd3-hierarchy'
import { pie } from 'd3-shape'

// Utils
import { getNumber, groupBy } from 'utils/data'

// Types
import { NumericAccessor } from 'types/accessor'

// Local Types
import { ChordNode, ChordRibbon, ChordLinkDatum, ChordHierarchyNode, ChordLeafNode } from '../types'

function transformData <T> (node: HierarchyNode<T>): void {
  const { height, depth } = node
  if (height > 0) {
    const d = node.data as unknown as [string, T[]]
    const n = node as unknown as HierarchyNode<ChordHierarchyNode<T>>
    n.data = { key: d[0], values: d[1], depth, height, ancestors: n.ancestors().map(d => d.data.key) }
  }
}

export function getHierarchyNodes<N> (
  data: N[],
  value: NumericAccessor<N>,
  levels: string[] = []
): HierarchyNode<ChordHierarchyNode<N>> {
  const nodeLevels = levels.map(level => (d: N) => d[level as keyof N]) as unknown as [(d: N) => string]
  const nestedData = levels.length ? group<N, string>(data, ...nodeLevels) : { key: 'root', children: data }

  const root = hierarchy(nestedData)
    .sum(d => getNumber(d as unknown as N, value))
    .each(transformData)

  return root as unknown as HierarchyNode<ChordHierarchyNode<N>>
}

export function positionChildren<N> (node: ChordNode<N>, padding: number, scalingCoeff = 0.95): void {
  if (!node.children) return

  const length = node.x1 - node.x0
  const scaledLength = length * scalingCoeff
  const delta = length - scaledLength

  const positions = pie<ChordNode<N>>()
    .startAngle(node.x0 + delta / 2)
    .endAngle(node.x1 - delta / 2)
    .padAngle(padding)
    .value(d => d.value)
    .sort((a, b) => node.children.indexOf(a) - node.children.indexOf(b))(node.children)

  node.children.forEach((child, i) => {
    const x0 = positions[i].startAngle
    const x1 = positions[i].endAngle
    const childDelta = (x1 - x0) * (1 - scalingCoeff)
    child.x0 = x0 + childDelta / 2
    child.x1 = x1 - childDelta / 2
  })
}

export function getRibbons<N> (data: ChordNode<N>, links: ChordLinkDatum<N>[], padding: number): ChordRibbon<N>[] {
  type LinksArrayType = typeof links
  const groupedBySource: Record<string, LinksArrayType> = groupBy(links, d => d.source._id)
  const groupedByTarget: Record<string, LinksArrayType> = groupBy(links, d => d.target._id)

  const leafNodes = data.leaves() as ChordLeafNode<N>[]
  const leafNodesById: Map<string, ChordLeafNode<N>> = index(leafNodes, d => d.data._id)

  const getNodesInRibbon = (
    source: ChordLeafNode<N>,
    target: ChordLeafNode<N>,
    partitionHeight: number,
    nodes: ChordNode<N>[] = []
  ): ChordNode<N>[] => {
    nodes[source.height] = source
    nodes[partitionHeight * 2 - target.height] = target
    if (source.parent && target.parent) getNodesInRibbon(source.parent, target.parent, partitionHeight, nodes)
    return nodes
  }
  const calculatePoints = (links: LinksArrayType, type: 'in' | 'out', depth: number, maxDepth: number): void => {
    links.forEach(link => {
      if (!link._state.points) link._state.points = []

      const sourceLeaf = leafNodesById.get(link.source._id)
      const targetLeaf = leafNodesById.get(link.target._id)
      const nodesInRibbon = getNodesInRibbon(
        type === 'out' ? sourceLeaf : targetLeaf,
        type === 'out' ? targetLeaf : sourceLeaf,
        maxDepth
      )
      const currNode = nodesInRibbon[depth]
      const len = currNode.x1 - currNode.x0 - padding
      const x0 = currNode._prevX1 ?? (currNode.x0 + padding / 2)
      const x1 = x0 + len * link._state.value / currNode.value
      currNode._prevX1 = x1

      const pointIdx = type === 'out' ? depth : maxDepth * 2 - 1 - depth
      link._state.points[pointIdx] = { a0: x0, a1: x1, r: currNode.y1 }
    })
  }

  leafNodes.forEach(leafNode => {
    const outLinks = groupedBySource[leafNode.data._id] || []
    const inLinks = groupedByTarget[leafNode.data._id] || []
    for (let depth = 0; depth < leafNode.depth; depth += 1) {
      calculatePoints(outLinks, 'out', depth, leafNode.depth)
      calculatePoints(inLinks, 'in', depth, leafNode.depth)
    }
  })

  return links.map(l => ({
    source: leafNodesById.get(l.source._id),
    target: leafNodesById.get(l.target._id),
    data: l,
    points: l._state.points,
    _state: {},
  }))
}
