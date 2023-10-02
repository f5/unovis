import { min, max, group } from 'd3-array'
import type { SimulationNodeDatum } from 'd3-force'
import type { ElkNode } from 'elkjs/lib/elk.bundled.js'

// Core
import { GraphDataModel } from 'data-models/graph'

// Utils
import { without, clamp, groupBy, unique, sortBy, getString, getNumber, getValue, merge } from 'utils/data'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Local Types
import { GraphNode, GraphLink } from '../types'

// Config
import { GraphConfigInterface } from '../config'

// Helpers
import { getMaxNodeSize, configuredNodeSize, getNodeSize, getAverageNodeSize } from './node/helper'
import {
  DEFAULT_ELK_SETTINGS,
  adjustElkHierarchyCoordinates,
  positionNonConnectedNodes,
  toElkHierarchy,
  GraphElkHierarchyNode,
} from './layout-helpers'

export function applyLayoutCircular<N extends GraphInputNode, L extends GraphInputLink> (
  datamodel: GraphDataModel<N, L, GraphNode<N, L>, GraphLink<N, L>>,
  config: GraphConfigInterface<N, L>,
  width: number,
  height: number
): void {
  const { nonConnectedNodes, connectedNodes, nodes } = datamodel
  const { layoutNonConnectedAside, nodeSize } = config

  const activeWidth = width
  const activeHeight = height

  // Handle layout nodes
  const layoutNodes = layoutNonConnectedAside ? connectedNodes : nodes
  const maxNodeSize = getMaxNodeSize(layoutNodes, nodeSize)
  const yRatio = activeHeight / maxNodeSize
  const yScaling = yRatio < layoutNodes.length / 2 ? layoutNodes.length / 2 / yRatio : 1
  const xRatio = activeWidth / maxNodeSize
  const xScaling = xRatio < layoutNodes.length / 2 ? layoutNodes.length / 2 / xRatio : 1
  const scaling = Math.max(xScaling, yScaling)

  layoutNodes.forEach((d, i) => {
    const rX = scaling * activeWidth / 2
    const rY = scaling * activeHeight / 2 // maxNodeSize * layoutNodes.length / 4
    const angle = 2 * i * Math.PI / layoutNodes.length
    d.x = activeWidth / 2 + rX * Math.cos(angle)
    d.y = activeHeight / 2 + rY * Math.sin(angle)
  })

  // Handle non-connected nodes
  if (layoutNonConnectedAside) {
    const maxSize = getMaxNodeSize(nonConnectedNodes, nodeSize)
    const maxY = max<number>(connectedNodes.map(d => d.y))
    const maxX = max<number>(connectedNodes.map(d => d.x))
    const minX = min<number>(connectedNodes.map(d => d.x))
    const graphWidth = maxX - minX
    positionNonConnectedNodes(nonConnectedNodes, maxY + maxSize * 3, maxSize * 2.25, Math.max(graphWidth, width), minX)
  }
}

export function applyLayoutParallel<N extends GraphInputNode, L extends GraphInputLink> (
  datamodel: GraphDataModel<N, L, GraphNode<N, L>, GraphLink<N, L>>,
  config: GraphConfigInterface<N, L>,
  width: number,
  height: number,
  orientation?: string
): void {
  const { nonConnectedNodes, connectedNodes, nodes } = datamodel
  const {
    layoutNonConnectedAside, layoutGroupOrder, layoutParallelSortConnectionsByGroup, layoutParallelNodesPerColumn,
    layoutParallelSubGroupsPerRow, nodeSize, layoutNodeGroup, layoutParallelNodeSubGroup, layoutParallelGroupSpacing,
  } = config

  const activeWidth = width - configuredNodeSize(nodeSize)
  const activeHeight = height - configuredNodeSize(nodeSize) - (nonConnectedNodes.length ? configuredNodeSize(nodeSize) * 5 : 0)

  // Handle connected nodes
  const layoutNodes = layoutNonConnectedAside ? connectedNodes : nodes
  const groupNames = unique(layoutNodes.map(d => getString(d, layoutNodeGroup, d._index)))
  const groupNamesSorted: string[] = sortBy(groupNames, d => layoutGroupOrder.indexOf(d))

  const groups = groupNamesSorted.map(groupName => {
    const groupNodes = layoutNodes.filter(d => getString(d, layoutNodeGroup, d._index) === groupName)
    const groupedBySubgroup = groupBy(groupNodes, d => getString(d, layoutParallelNodeSubGroup, d._index))
    const subgroups = Object.keys(groupedBySubgroup).map(name => ({
      nodes: groupedBySubgroup[name],
      name,
    }))

    return {
      name: groupName,
      nodes: groupNodes,
      subgroups,
    }
  })

  // Sort
  const group = groups.find(g => g.name === layoutParallelSortConnectionsByGroup)
  if (group) {
    const sortMap = {}
    let idx = 0
    group.subgroups.forEach(subgroup => {
      subgroup.nodes.forEach(node => {
        node.links.forEach(link => {
          const linkTargetId = link?.target._id
          sortMap[linkTargetId] = idx
          idx = idx + 1
        })
      })
    })

    without(groups, group).forEach(g => {
      g.subgroups.forEach(subgroup => {
        subgroup.nodes.sort((a, b) => {
          return (sortMap[a._id] || 0) - (sortMap[b._id] || 0)
        })
      })
    })
  }

  const maxN = max(groups, d => d.nodes?.length)
  const labelApprxHeight = 40
  const labelMargin = 10
  const subgroupMargin = 40
  const maxNodeSize = getMaxNodeSize(layoutNodes, nodeSize)

  if (orientation === 'horizontal') {
    const minHorizontalStep = 2 * maxNodeSize + labelMargin
    const maxHorizontalStep = 3.5 * maxNodeSize + labelMargin
    const horizontalStep = clamp(activeWidth / (maxN - 1), minHorizontalStep, maxHorizontalStep)

    const maxVerticalStep = maxNodeSize * 4 + labelApprxHeight
    const minVerticalStep = maxNodeSize * 1.5 + labelApprxHeight
    const verticalStep = (maxNodeSize + layoutParallelGroupSpacing) || clamp(activeHeight / (groups.length - 1), minVerticalStep, maxVerticalStep)
    const subgroupNodeStep = maxNodeSize + labelApprxHeight + labelMargin

    let y0 = (groups.length < 2) ? height / 2 : 0
    groups.forEach(group => {
      let x0 = 0
      let dy = 0
      let subgroupMaxWidth = 0
      let groupWidth = 0
      let groupHeight = 0
      let k = 0
      group.subgroups.forEach(subgroup => {
        const subgroupRows = Math.ceil(subgroup.nodes.length / layoutParallelNodesPerColumn)
        let n = 0
        let x = x0
        let y = y0 + dy
        subgroup.nodes.forEach(d => {
          x = x + horizontalStep
          d.x = x
          d.y = y
          groupWidth = Math.max(groupWidth, x)

          n = n + 1
          if (n >= layoutParallelNodesPerColumn) {
            n = 0
            y += subgroupNodeStep
            x = x0
          }
        })

        const subgroupWidth = Math.min(subgroup.nodes.length, layoutParallelNodesPerColumn) * horizontalStep
        const subgroupHeight = subgroupRows * subgroupNodeStep
        subgroupMaxWidth = Math.max(subgroupMaxWidth, subgroupWidth)
        dy = dy + subgroupHeight + subgroupMargin
        k = k + 1
        if (k >= layoutParallelSubGroupsPerRow) {
          k = 0
          dy = 0
          x0 = x0 + subgroupMaxWidth + subgroupMargin
          subgroupMaxWidth = 0
        }

        groupHeight = Math.max(groupHeight, y)
        // x0 += Math.min(subgroup.nodes.length, layoutParallelNodesPerColumn) * horizontalStep + subgroupMargin
      })

      // Center group horizontally
      group.subgroups.forEach(subgroup => {
        subgroup.nodes.forEach(d => {
          d.x -= groupWidth / 2
        })
      })
      groupWidth = 0

      // Update y0 for the next group
      y0 = groupHeight + verticalStep
    })
  } else {
    const minHorizontalStep = 6 * maxNodeSize + labelMargin
    const maxHorizontalStep = 10 * maxNodeSize + labelMargin
    const horizontalStep = (maxNodeSize + layoutParallelGroupSpacing) || clamp(activeWidth / (maxN - 1), minHorizontalStep, maxHorizontalStep)

    const maxVerticalStep = maxNodeSize * 2.0 + labelApprxHeight
    const minVerticalStep = maxNodeSize * 1.5 + labelApprxHeight
    const verticalStep = clamp(activeHeight / (groups.length - 1), minVerticalStep, maxVerticalStep)
    const subgroupNodeStep = maxNodeSize * 2.0

    let x0 = (groups.length < 2) ? width / 2 : 0
    groups.forEach(group => {
      let y0 = 0
      let dx = 0 // Horizontal shift inside the group (column)
      let subgroupMaxHeight = 0
      let groupWidth = 0
      let groupHeight = 0

      let k = 0
      group.subgroups.forEach(subgroup => {
        const subgroupColumns = Math.ceil(subgroup.nodes.length / layoutParallelNodesPerColumn)
        let n = 0
        let y = y0
        let x = x0 + dx
        subgroup.nodes.forEach(d => {
          y = y + verticalStep
          d.x = x
          d.y = y
          groupHeight = Math.max(groupHeight, y)

          n = n + 1
          if (n >= layoutParallelNodesPerColumn) {
            n = 0
            x += subgroupNodeStep
            y = y0
          }
        })

        const subgroupHeight = Math.min(subgroup.nodes.length, layoutParallelNodesPerColumn) * verticalStep
        const subgroupWidth = subgroupColumns * subgroupNodeStep
        subgroupMaxHeight = Math.max(subgroupMaxHeight, subgroupHeight)
        dx = dx + subgroupWidth + subgroupMargin
        k = k + 1
        if (k >= layoutParallelSubGroupsPerRow) {
          k = 0
          dx = 0
          y0 = y0 + subgroupMaxHeight + subgroupMargin
          subgroupMaxHeight = 0
        }

        groupWidth = Math.max(groupWidth, x)
      })

      // Center group vertically
      group.subgroups.forEach(subgroup => {
        subgroup.nodes.forEach(d => {
          d.y -= groupHeight / 2
        })
      })
      groupHeight = 0

      // Update x0 for the next group
      x0 = groupWidth + horizontalStep
    })
  }

  // Handle non-connected nodes
  if (layoutNonConnectedAside) {
    const maxSize = getMaxNodeSize(nonConnectedNodes, nodeSize)
    const maxY = max<number>(connectedNodes.map(d => d.y)) || 0
    const maxX = max<number>(connectedNodes.map(d => d.x)) || 0
    const minX = min<number>(connectedNodes.map(d => d.x)) || 0
    const graphWidth = (maxX - minX) || width
    positionNonConnectedNodes(nonConnectedNodes, maxY + maxSize * 3, maxSize * 2.25, Math.max(graphWidth, width))
  }
}

export async function applyLayoutDagre<N extends GraphInputNode, L extends GraphInputLink> (
  datamodel: GraphDataModel<N, L, GraphNode<N, L>, GraphLink<N, L>>,
  config: GraphConfigInterface<N, L>,
  width: number
): Promise<void> {
  const { nonConnectedNodes, connectedNodes, nodes, links } = datamodel
  const { nodeSize, layoutNonConnectedAside, dagreLayoutSettings, nodeStrokeWidth, nodeLabel } = config

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { Graph } = await import('@unovis/graphlibrary')
  const { layout } = await import('@unovis/dagre-layout')

  // https://github.com/dagrejs/dagre/wiki
  const dagreGraph = new Graph()

  // Set an object for the graph label
  dagreGraph.setGraph(dagreLayoutSettings)

  // Default to assigning a new object as a label for each new edge.
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  // Add nodes to the graph. The first argument is the node id. The second is
  // metadata about the node. In this case we're going to add labels to each of
  // our nodes.
  const labelApprxHeight = 40
  const nds = (layoutNonConnectedAside ? connectedNodes : nodes)
  nds.forEach(node => {
    dagreGraph.setNode(node._index, {
      label: getString(node, nodeLabel, node._index),
      width: getNumber(node, nodeSize, node._index) * 1.5 + getNumber(node, nodeStrokeWidth, node._index),
      height: labelApprxHeight + getNumber(node, nodeSize, node._index) * 1.5,
      originalNode: node,
    })
  })

  // Add edges to the graph.
  links.forEach(link => {
    dagreGraph.setEdge((link.source as GraphNode)._index, (link.target as GraphNode)._index)
  })

  // Calculate the layout
  layout(dagreGraph)

  // Apply coordinates to the graph
  dagreGraph.nodes().forEach(d => {
    const node = dagreGraph.node(d)
    node.originalNode.x = node.x // width * d.x / dagreGraph._label.width
    node.originalNode.y = node.y // height * d.y / dagreGraph._label.height
  })

  // Handle non-connected nodes
  if (layoutNonConnectedAside) {
    const maxNodeSize = getMaxNodeSize(nonConnectedNodes, nodeSize)
    const maxY = max<number>(connectedNodes.map(d => d.y))
    const maxX = max<number>(connectedNodes.map(d => d.x))
    const minX = min<number>(connectedNodes.map(d => d.x))
    const graphWidth = maxX - minX
    positionNonConnectedNodes(nonConnectedNodes, maxY + maxNodeSize * 3, maxNodeSize * 2.25, Math.max(graphWidth, width), 0)
  }
}

export function applyLayoutConcentric<N extends GraphInputNode, L extends GraphInputLink> (
  datamodel: GraphDataModel<N, L, GraphNode<N, L>, GraphLink<N, L>>,
  config: GraphConfigInterface<N, L>,
  width: number,
  height: number
): void {
  const { nonConnectedNodes, connectedNodes, nodes } = datamodel
  const { layoutNonConnectedAside, layoutGroupOrder, nodeSize, layoutNodeGroup } = config

  const layoutNodes = layoutNonConnectedAside ? connectedNodes : nodes

  const groupNames: string[] = unique(layoutNodes.map(d => getString(d, layoutNodeGroup, d._index)))
  const groupNamesSorted: string[] = sortBy(groupNames, d => layoutGroupOrder.indexOf(d))

  const groups = groupNamesSorted.map(groupName => ({
    name: groupName,
    nodes: layoutNodes.filter(d => getString(d, layoutNodeGroup, d._index) === groupName),
  }))

  // Handle connected nodes
  let r = 2 * getAverageNodeSize(groups[0]?.nodes ?? [], nodeSize)
  const widthToHeightRatio = width / height

  groups.forEach((group, i) => {
    const avgNodeSize = getAverageNodeSize(group.nodes, nodeSize)
    const requiredRadius = 1.1 * avgNodeSize * group.nodes.length / Math.PI
    if (r < requiredRadius) r = requiredRadius

    group.nodes.forEach((node, j) => {
      // If the first (central) group has only one node
      if (i === 0 && group.nodes.length === 1) {
        node.x = width / 2
        node.y = height / 2
      } else {
        let dAngle = 0
        if (i === 0 && group.nodes.length === 3) dAngle = Math.PI / 6
        if (i === 0 && group.nodes.length === 4) dAngle = Math.PI / 4
        const angle = 2 * j * Math.PI / group.nodes.length + i * Math.PI / 12 + dAngle
        node.x = width / 2 + r * Math.cos(angle) * widthToHeightRatio
        node.y = height / 2 + r * Math.sin(angle)
      }
    })

    const groupSpacing = avgNodeSize * 3
    r += groupSpacing
  })

  // Handle non-connected nodes
  if (layoutNonConnectedAside) {
    const maxSize = getMaxNodeSize(nonConnectedNodes, nodeSize)
    const maxY = max<number>(connectedNodes.map(d => d.y))
    const maxX = max<number>(connectedNodes.map(d => d.x))
    const minX = min<number>(connectedNodes.map(d => d.x))
    const graphWidth = maxX - minX
    positionNonConnectedNodes(nonConnectedNodes, maxY + maxSize * 3, maxSize * 2.25, graphWidth, minX)
  }
}

export async function applyLayoutForce<N extends GraphInputNode, L extends GraphInputLink> (
  datamodel: GraphDataModel<N, L, GraphNode<N, L>, GraphLink<N, L>>,
  config: GraphConfigInterface<N, L>,
  width: number
): Promise<void> {
  const { layoutNonConnectedAside, forceLayoutSettings: { linkDistance, linkStrength, charge, forceXStrength, forceYStrength }, nodeSize } = config

  const { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCollide } = await import('d3-force')

  const { nonConnectedNodes, connectedNodes, nodes, links } = datamodel
  const simulation = forceSimulation(layoutNonConnectedAside ? connectedNodes : nodes)
    .force('link', forceLink(links)
      .id((d) => String((d as GraphNode<N, L>)._id))
      .distance(linkDistance)
      .strength(linkStrength)
    )
    .force('charge', forceManyBody().strength(d => {
      const linkCount = links.reduce((count, l) => count + Number((l.source === d) || (l.target === d)), 0)
      return charge * Math.sqrt(linkCount)
    }))
    .force('x', forceX().strength(forceXStrength))
    .force('y', forceY().strength(forceYStrength))
    .force('collide', forceCollide<SimulationNodeDatum & N>().radius((d, i) => getNodeSize(d, nodeSize, i)).iterations(1))
    .stop()

  // See https://bl.ocks.org/mbostock/1667139, https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
  for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    simulation.tick()
  }

  // Translate coordinates to values > 0 for better animated transition between layout
  const yMin = min<number>(connectedNodes.map(d => d.y)) ?? 0
  const xMin = min<number>(connectedNodes.map(d => d.x)) ?? 0
  nodes.forEach(d => {
    d.x -= xMin
    d.y -= yMin
  })

  // Handle non-connected nodes
  if (layoutNonConnectedAside) {
    const maxSize = getMaxNodeSize(nonConnectedNodes, nodeSize)
    const maxY = max<number>(connectedNodes.map(d => d.y))
    const maxX = max<number>(connectedNodes.map(d => d.x))
    const minX = min<number>(connectedNodes.map(d => d.x))
    const graphWidth = maxX - minX
    positionNonConnectedNodes(nonConnectedNodes, maxY + maxSize * 6, maxSize * 2.25, Math.max(graphWidth, width), minX)
  }
}

export async function applyELKLayout<N extends GraphInputNode, L extends GraphInputLink> (
  datamodel: GraphDataModel<N, L, GraphNode<N, L>, GraphLink<N, L>>,
  config: GraphConfigInterface<N, L>,
  width: number
): Promise<void> {
  const ELK = (await import('elkjs/lib/elk.bundled.js')).default
  const elk = new ELK()

  const labelApprxHeight = 30
  const nodes = datamodel.nodes.map(n => ({
    ...n,
    id: n._id,
    width: getNumber(n, config.nodeSize, n._index) + getNumber(n, config.nodeStrokeWidth, n._index),
    height: getNumber(n, config.nodeSize, n._index) + labelApprxHeight,
  }))

  let elkNodes: (GraphNode<N, L> | GraphElkHierarchyNode<N, L>)[]
  if (config.layoutElkNodeGroups) {
    const groupingFunctions = config.layoutElkNodeGroups
      .map(accessor => (d: GraphNode<N, L>) => getString(d, accessor, d._index)) as [(d: GraphNode<N, L>) => string]
    const grouped = group(nodes, ...groupingFunctions)
    elkNodes = toElkHierarchy(grouped, config.layoutElkSettings)
  } else {
    elkNodes = nodes
  }

  const rootNodeId = 'root'
  const elkGraph: ElkNode = {
    id: rootNodeId,
    layoutOptions: merge(DEFAULT_ELK_SETTINGS, getValue(rootNodeId, config.layoutElkSettings)),
    children: elkNodes as ElkNode[],
    edges: datamodel.links.map(l => ({
      id: l._id,
      sources: [l.source._id],
      targets: [l.target._id],
    })),
  }

  const layout = await elk.layout(elkGraph)
  adjustElkHierarchyCoordinates(layout)

  nodes.forEach((node, i) => {
    const found = datamodel.nodes.find(n => n._id === node.id)
    if (!found) return

    found.x = node.x
    found.y = node.y
  })

  // Handle non-connected nodes
  if (config.layoutNonConnectedAside) {
    const maxSize = getMaxNodeSize(datamodel.nonConnectedNodes, config.nodeSize)
    const maxY = max<number>(datamodel.connectedNodes.map(d => d.y)) || 0
    const maxX = max<number>(datamodel.connectedNodes.map(d => d.x)) || 0
    const minX = min<number>(datamodel.connectedNodes.map(d => d.x)) || 0
    const graphWidth = (maxX - minX) || width
    positionNonConnectedNodes(datamodel.nonConnectedNodes, maxY + maxSize * 3, maxSize * 2.25, Math.max(graphWidth, width))
  }
}
