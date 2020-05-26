// Copyright (c) Volterra, Inc. All rights reserved.
import dagre from 'dagre-layout'
import { min, max } from 'd3-array'
import { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCollide } from 'd3-force'
import { Graph } from 'graphlibrary'

// Core
import { GraphDataModel } from 'data-models/graph'

// Types
import { NodeDatumCore, LinkDatumCore } from 'types/graph'

// Utils
import { without, clamp, groupBy, uniq, sortBy, getValue } from 'utils/data'

// Config
import { GraphConfigInterface } from '../config'

// Heleprs
import { getMaxNodeSize, configuredNodeSize, getNodeSize } from './node/helper'
import { positionNonConnectedNodes } from './layout-helpers'

export function applyLayoutCircular<N extends NodeDatumCore, L extends LinkDatumCore> (datamodel: GraphDataModel<N, L>, config: GraphConfigInterface<N, L>): void {
  const { nonConnectedNodes, connectedNodes, nodes } = datamodel
  const { layoutNonConnectedAside, width, height, nodeSize } = config

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

export function applyLayoutParallel<N extends NodeDatumCore, L extends LinkDatumCore> (datamodel: GraphDataModel<N, L>, config: GraphConfigInterface<N, L>, orientation?: string): void {
  const { nonConnectedNodes, connectedNodes, nodes } = datamodel
  const {
    layoutNonConnectedAside, layoutGroupOrder, layoutSortConnectionsByGroup,
    layoutSubgroupMaxNodes, nodeSize, nodeGroup, nodeSubGroup, width, height,
  } = config

  const activeWidth = width - configuredNodeSize(nodeSize)
  const activeHeight = height - configuredNodeSize(nodeSize) - (nonConnectedNodes.length ? configuredNodeSize(nodeSize) * 5 : 0)

  // Handle connected nodes
  const layoutNodes = layoutNonConnectedAside ? connectedNodes : nodes
  const groupNames: any[] = uniq(layoutNodes.map(d => getValue(d, nodeGroup)))
  const groupNamesSorted: any[] = sortBy(groupNames, d => layoutGroupOrder.indexOf(d))

  const groups = groupNamesSorted.map(groupName => {
    const groupNodes = layoutNodes.filter(d => getValue(d, nodeGroup) === groupName)
    const groupedBySubgroup = groupBy(groupNodes, d => getValue(d, nodeSubGroup))
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
  const group = groups.find(g => g.name === layoutSortConnectionsByGroup)
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
    const verticalStep = clamp(activeHeight / (groups.length - 1), minVerticalStep, maxVerticalStep)
    const subgroupNodeStep = maxNodeSize + labelApprxHeight + labelMargin

    let y0 = (groups.length < 2) ? height / 2 : 0
    groups.forEach(group => {
      const maxSubgroupNodes = Math.max(...group.subgroups.map(subgroup => subgroup.nodes.length))
      const maxSubroupRows = Math.ceil(maxSubgroupNodes / layoutSubgroupMaxNodes) - 1
      const groupSize = group.nodes.length
      const singleNodeGroup = groupSize < 2
      const rowWidth = group.subgroups.reduce((acc, subgroup) => {
        return acc + Math.min(subgroup.nodes.length, layoutSubgroupMaxNodes) * horizontalStep + subgroupMargin
      }, 0)

      let x0 = (singleNodeGroup ? 0 : -rowWidth / 2) - horizontalStep
      group.subgroups.forEach((subgroup, k) => {
        const subgroupRows = Math.ceil(subgroup.nodes.length / layoutSubgroupMaxNodes) - 1
        let n = 0
        let x = x0
        let y = y0 + (maxSubroupRows - subgroupRows) / 2 * subgroupNodeStep
        subgroup.nodes.forEach(d => {
          x = x + horizontalStep
          d.x = x
          d.y = y

          n = n + 1
          if (n >= layoutSubgroupMaxNodes) {
            n = 0
            y += subgroupNodeStep
            x = x0
          }
        })

        x0 += Math.min(subgroup.nodes.length, layoutSubgroupMaxNodes) * horizontalStep + subgroupMargin
      })

      y0 += verticalStep + (Math.ceil(maxSubgroupNodes / layoutSubgroupMaxNodes) - 1) * subgroupNodeStep
    })
  } else {
    const minHorizontalStep = 6 * maxNodeSize + labelMargin
    const maxHorizontalStep = 10 * maxNodeSize + labelMargin
    const horizontalStep = clamp(activeWidth / (maxN - 1), minHorizontalStep, maxHorizontalStep)

    const maxVerticalStep = maxNodeSize * 2.0 + labelApprxHeight
    const minVerticalStep = maxNodeSize * 1.5 + labelApprxHeight
    const verticalStep = clamp(activeHeight / (groups.length - 1), minVerticalStep, maxVerticalStep)
    const subgroupNodeStep = maxNodeSize * 2.0

    let x0 = (groups.length < 2) ? width / 2 : 0
    groups.forEach((group, i) => {
      const maxSubgroupNodes = Math.max(...group.subgroups.map(subgroup => subgroup.nodes.length))
      const maxSubroupColumns = Math.ceil(maxSubgroupNodes / layoutSubgroupMaxNodes) - 1
      const columnHeight = group.subgroups.reduce((acc, subgroup) => {
        return acc + Math.min(subgroup.nodes.length, layoutSubgroupMaxNodes) * verticalStep + subgroupMargin
      }, 0)

      let y0 = -columnHeight / 2
      group.subgroups.forEach((subgroup, k) => {
        const subgroupColumns = Math.ceil(subgroup.nodes.length / layoutSubgroupMaxNodes) - 1
        let n = 0
        let y = y0
        let x = x0 + (maxSubroupColumns - subgroupColumns) / 2 * subgroupNodeStep
        subgroup.nodes.forEach(d => {
          y = y + verticalStep
          d.x = x
          d.y = y

          n = n + 1
          if (n >= layoutSubgroupMaxNodes) {
            n = 0
            x += subgroupNodeStep
            y = y0
          }
        })

        y0 += Math.min(subgroup.nodes.length, layoutSubgroupMaxNodes) * verticalStep + subgroupMargin
      })

      x0 += horizontalStep + (Math.ceil(maxSubgroupNodes / layoutSubgroupMaxNodes) - 1) * subgroupNodeStep
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

export function applyLayoutDagre<N extends NodeDatumCore, L extends LinkDatumCore> (datamodel: GraphDataModel<N, L>, config: GraphConfigInterface<N, L>): void {
  const { nonConnectedNodes, connectedNodes, nodes, links } = datamodel
  const { nodeSize, layoutNonConnectedAside, width, dagreLayoutSettings, nodeBorderWidth, nodeLabel } = config

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
      label: getValue(node, nodeLabel),
      width: getValue(node, nodeSize) * 1.5 + getValue(node, nodeBorderWidth),
      height: labelApprxHeight + getValue(node, nodeSize) * 1.5,
      originalNode: node,
    })
  })

  // Add edges to the graph.
  links.forEach(link => {
    dagreGraph.setEdge((link.source as NodeDatumCore)._index, (link.target as NodeDatumCore)._index)
  })

  // Calculate the layout
  dagre.layout(dagreGraph)

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

export function applyLayoutConcentric<N extends NodeDatumCore, L extends LinkDatumCore> (datamodel: GraphDataModel<N, L>, config: GraphConfigInterface<N, L>): void {
  const { nonConnectedNodes, connectedNodes, nodes } = datamodel
  const { layoutNonConnectedAside, layoutGroupOrder, nodeSize, nodeGroup, width, height } = config

  const layoutNodes = layoutNonConnectedAside ? connectedNodes : nodes

  const groupNames = uniq(layoutNodes.map(d => getValue(d, nodeGroup)))
  const groupNamesSorted = sortBy(groupNames, d => layoutGroupOrder.indexOf(d))

  const groups = groupNamesSorted.map(groupName => ({
    name: groupName,
    nodes: layoutNodes.filter(d => getValue(d, nodeGroup) === groupName),
  }))

  // Handle connected nodes
  let r = 0
  const groupSpacing = configuredNodeSize(nodeSize) * 5
  groups.forEach((group, i) => {
    const maxNodeSize = getMaxNodeSize(group.nodes, nodeSize)
    r = r + groupSpacing
    const d = (0.25 * maxNodeSize * group.nodes.length - 2 * r)
    if (d > 0) r += d

    group.nodes.forEach((node, j) => {
      // If the first (central) group has only one node
      if (i === 0 && group.nodes.length === 1) {
        node.x = width / 2
        node.y = height / 2
      } else {
        const angle = 2 * j * Math.PI / group.nodes.length + i * Math.PI / 12
        node.x = width / 2 + r * Math.cos(angle)
        node.y = height / 2 + r * Math.sin(angle)
      }
    })
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

export function applyLayoutForce<N extends NodeDatumCore, L extends LinkDatumCore> (datamodel: GraphDataModel<N, L>, config: GraphConfigInterface<N, L>): void {
  const { layoutNonConnectedAside, forceLayoutSettings: { linkDistance, linkStrength, charge, forceXStrength, forceYStrength }, nodeSize, width } = config

  const { nonConnectedNodes, connectedNodes, nodes, links } = datamodel
  const simulation = forceSimulation(layoutNonConnectedAside ? connectedNodes : nodes)
    .force('link', forceLink(links).id((d: N) => String(d._id)).distance(linkDistance).strength(linkStrength))
    .force('charge', forceManyBody().strength(d => {
      const linkCount = links.reduce((count, l) => count + Number((l.source === d) || (l.target === d)), 0)
      return charge * Math.sqrt(linkCount)
    }))
    .force('x', forceX().strength(forceXStrength))
    .force('y', forceY().strength(forceYStrength))
    .force('collide', forceCollide().radius(d => getNodeSize(d, nodeSize)).iterations(1))
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
