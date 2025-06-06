import { min, max, group } from 'd3-array'
import type { SimulationNodeDatum } from 'd3-force'
import type { ElkNode } from 'elkjs/lib/elk.bundled.js'
import type { graphlib, Node } from 'dagre'

// Core
import { GraphDataModel } from 'data-models/graph'

// Utils
import { without, clamp, groupBy, unique, sortBy, getString, getNumber, getValue, merge, isFunction, isNil, isArray } from 'utils/data'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Local Types
import { GraphNode, GraphLink, GraphForceSimulationNode } from '../types'

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
    layoutParallelNodeSpacing, layoutParallelSubGroupSpacing,
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
    const sortMap: Record<string, number> = {}
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
  const subgroupSpacing = layoutParallelSubGroupSpacing ?? 0
  const maxNodeSize = getMaxNodeSize(layoutNodes, nodeSize)

  const configuredNodeSpacing = isArray(layoutParallelNodeSpacing) ? layoutParallelNodeSpacing : [layoutParallelNodeSpacing, layoutParallelNodeSpacing]
  if (orientation === 'horizontal') {
    const minHorizontalSpacing = 2 * maxNodeSize + labelMargin
    const maxHorizontalSpacing = 3.5 * maxNodeSize + labelMargin
    const horizontalNodeSpacing = configuredNodeSpacing[0] ?? clamp(activeWidth / (maxN - 1), minHorizontalSpacing, maxHorizontalSpacing)

    const maxVerticalStep = maxNodeSize * 4 + labelApprxHeight
    const minVerticalStep = maxNodeSize * 1.5 + labelApprxHeight
    const groupSpacing = layoutParallelGroupSpacing ?? clamp(activeHeight / (groups.length - 1), minVerticalStep, maxVerticalStep)
    const verticalNodeSpacing = configuredNodeSpacing[1] ?? maxNodeSize + labelApprxHeight + labelMargin

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
          x = x + horizontalNodeSpacing
          d.x = x
          d.y = y
          groupWidth = Math.max(groupWidth, x)

          n = n + 1
          if (n >= layoutParallelNodesPerColumn) {
            n = 0
            y += verticalNodeSpacing
            x = x0
          }
        })

        const subgroupWidth = Math.min(subgroup.nodes.length, layoutParallelNodesPerColumn) * horizontalNodeSpacing
        const subgroupHeight = subgroupRows * verticalNodeSpacing
        subgroupMaxWidth = Math.max(subgroupMaxWidth, subgroupWidth)
        dy = dy + subgroupHeight + subgroupSpacing
        k = k + 1
        if (k >= layoutParallelSubGroupsPerRow) {
          k = 0
          dy = 0
          x0 = x0 + subgroupMaxWidth + subgroupSpacing
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
      y0 = groupHeight + groupSpacing
    })
  } else {
    const groupSpacingMin = 6 * maxNodeSize + labelMargin
    const groupSpacingMax = 10 * maxNodeSize + labelMargin
    const groupSpacing = (layoutParallelGroupSpacing ?? clamp(activeWidth / (maxN - 1), groupSpacingMin, groupSpacingMax))

    const minVerticalSpacing = maxNodeSize * 2.0 + labelApprxHeight
    const maxVerticalSpacing = maxNodeSize * 1.5 + labelApprxHeight
    const verticalNodeSpacing = configuredNodeSpacing[1] ?? clamp(activeHeight / (groups.length - 1), maxVerticalSpacing, minVerticalSpacing)
    const horizontalNodeSpacing = configuredNodeSpacing[0] ?? maxNodeSize * 2.0

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
          y = y + verticalNodeSpacing
          d.x = x
          d.y = y
          groupHeight = Math.max(groupHeight, y)

          n = n + 1
          if (n >= layoutParallelNodesPerColumn) {
            n = 0
            x += horizontalNodeSpacing
            y = y0
          }
        })

        const subgroupHeight = Math.min(subgroup.nodes.length, layoutParallelNodesPerColumn) * verticalNodeSpacing
        const subgroupWidth = subgroupColumns * horizontalNodeSpacing
        subgroupMaxHeight = Math.max(subgroupMaxHeight, subgroupHeight)
        dx = dx + subgroupWidth + subgroupSpacing
        k = k + 1
        if (k >= layoutParallelSubGroupsPerRow) {
          k = 0
          dx = 0
          y0 = y0 + subgroupMaxHeight + subgroupSpacing
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
      x0 = groupWidth + groupSpacing
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

  // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { Graph } = await import('@unovis/graphlibrary')
  // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { layout } = await import('@unovis/dagre-layout')

  // https://github.com/dagrejs/dagre/wiki
  const dagreGraph = new Graph() as graphlib.Graph<GraphNode<N, L>>

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
    dagreGraph.setNode(`${node._index}`, {
      label: getString(node, nodeLabel, node._index),
      width: getNumber(node, nodeSize, node._index) * 1.5 + getNumber(node, nodeStrokeWidth, node._index),
      height: labelApprxHeight + getNumber(node, nodeSize, node._index) * 1.5,
      originalNode: node,
    })
  })

  // Add edges to the graph.
  links.forEach(link => {
    dagreGraph.setEdge(
      `${link.source._index}`,
      `${link.target._index}`
    )
  })

  // Calculate the layout
  layout(dagreGraph)

  // Apply coordinates to the graph
  dagreGraph.nodes().forEach(d => {
    const node = dagreGraph.node(d) as Node<GraphNode<N, L>> & { originalNode: GraphNode<N, L>}
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
  const { layoutNonConnectedAside, forceLayoutSettings, nodeSize } = config

  const { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCollide } = await import('d3-force')

  const { nonConnectedNodes, connectedNodes, nodes, links } = datamodel


  // Apply fx and fy to nodes if present before running the simulation
  if (forceLayoutSettings.fixNodePositionAfterSimulation) {
    nodes.forEach((d: GraphForceSimulationNode<N, L>) => {
      d.fx = isNil(d._state.fx) ? undefined : d._state.fx
      d.fy = isNil(d._state.fy) ? undefined : d._state.fy
    })
  } else {
    nodes.forEach((d: GraphForceSimulationNode<N, L>) => {
      delete d._state.fx
      delete d._state.fy
    })
  }

  const simulation = forceSimulation(layoutNonConnectedAside ? connectedNodes : nodes)
    .force('link', forceLink(links)
      .id((d) => String((d as GraphNode<N, L>)._id))
      .distance((l, i) => isFunction(forceLayoutSettings.linkDistance) ? forceLayoutSettings.linkDistance(l, i) : forceLayoutSettings.linkDistance)
      .strength((l, i) => isFunction(forceLayoutSettings.linkStrength) ? forceLayoutSettings.linkStrength(l, i) : forceLayoutSettings.linkStrength)
    )
    .force('charge', forceManyBody().strength((d, i) => {
      if (isFunction(forceLayoutSettings.charge)) {
        return forceLayoutSettings.charge(d as GraphNode<N, L>, i)
      } else {
        const linkCount = links.reduce((count, l) => count + Number((l.source === d) || (l.target === d)), 0)
        return forceLayoutSettings.charge * Math.sqrt(linkCount)
      }
    }))
    .force('x', forceX().strength(forceLayoutSettings.forceXStrength))
    .force('y', forceY().strength(forceLayoutSettings.forceYStrength))
    .force('collide', forceCollide<SimulationNodeDatum & N>().radius((d, i) => getNodeSize(d, nodeSize, i)).iterations(1))
    .stop()

  // See https://bl.ocks.org/mbostock/1667139, https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
  const numIterations = forceLayoutSettings.numIterations ?? Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()))
  for (let i = 0, n = numIterations; i < n; ++i) {
    simulation.tick()
  }

  // Fix node positions to `_state` if requested.
  // And remove fx and fy from the node datum if present to make sure the nodes are not fixed
  // if the layout was changed to a different layout and then back to force
  if (forceLayoutSettings.fixNodePositionAfterSimulation) {
    nodes.forEach((d: GraphForceSimulationNode<N, L>) => {
      delete d.fx
      delete d.fy
      d._state.fx = d.x
      d._state.fy = d.y
    })
  }

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
  const nodes = datamodel.nodes.map((n, i) => ({
    ...n,
    id: n._id,
    width: getNumber(n, config.nodeSize, n._index) + getNumber(n, config.nodeStrokeWidth, n._index),
    height: getNumber(n, config.nodeSize, n._index) + labelApprxHeight,
    ...(config.layoutElkGetNodeShape ? config.layoutElkGetNodeShape(n, i) : {}),
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

    found.x = node.x + node.width / 2
    found.y = node.y + node.height / 2
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
