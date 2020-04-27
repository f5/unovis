// Copyright (c) Volterra, Inc. All rights reserved.
import _sample from 'lodash/sample'
import _uniq from 'lodash/uniq'
import { Graph, LayoutType, GraphConfigInterface } from '@volterra/vis'

const StatusMap = {
  healthy: { color: '#47e845' },
  warning: { color: '#ffc226' },
  inactive: { color: '#dddddd' },
  alert: { color: '#f88080' },
}

export const accessors: GraphConfigInterface<any, any> = {
  nodeSize: d => d.nodeSize,
  nodeShape: d => d.shape,
  nodeStrokeSegmentValue: d => d.score, // d.totalScore || d.score || 50 + 50 * Math.random(),
  nodeStrokeSegmentFill: d => StatusMap[d.status]?.color,
  nodeStroke: '#ced3de',
  nodeIcon: d => d.icon,
  nodeLabel: d => d.label,
  nodeSubLabel: d => d.sublabel,
  nodeGroup: d => d.group,
  nodeSideLabels: d => d.sideLabels,
  nodeDisabled: d => d.disabled,
  nodeFill: d => d.fill || 'white',
  linkArrow: l => l.linkArrow,
  linkFlow: l => l.showTraffic,
  linkLabel: l => l.linkLabel,
  linkStroke: l => l.score === 100 ? 'rgba(49, 208, 49, 0.500)' : null,
  linkBandWidth: 2,
}

export const overviewConfig = (data, onNodeClick): GraphConfigInterface<any, any> => ({
  ...accessors,

  // Layout
  layoutType: LayoutType.PARALLEL,
  layoutGroupOrder: ['column1', 'ce01-ashburn-aws', 'column3'],

  // Events
  events: {
    [Graph.selectors.node]: {
      click: (d) => { onNodeClick(d) },
    },
  },

  // Panels
  panels: _uniq(data.nodes.map(d => d.site)).map(label => ({
    label,
    nodes: data.nodes.filter(d => d.site === label).map(d => d.id),
    color: '#333',
    borderWidth: 1,
    padding: 15,
    selectionOutline: label === 'ce01-ashburn-aws',
    // sideLabelIcon: 'T',
    // sideLabelShape: SHAPE.CIRCLE,
    // sideLabelColor: '#8ee422',
  })),
})

export const drilldownConfig = (onNodeClick): GraphConfigInterface<any, any> => ({
  ...accessors,

  // Layout
  layoutType: LayoutType.FORCE,

  // Events
  events: {
    [Graph.selectors.node]: {
      click: (d) => { onNodeClick(d) },
    },
  },
})
