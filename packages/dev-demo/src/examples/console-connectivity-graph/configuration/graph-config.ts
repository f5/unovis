import _sample from 'lodash-es/sample'
import { Graph, GraphLayoutType, GraphConfigInterface } from '@unovis/ts'

// const StatusMap = {
//   healthy: { color: '#47e845' },
//   warning: { color: '#ffc226' },
//   inactive: { color: '#dddddd' },
//   alert: { color: '#f88080' },
// }

export const accessors: GraphConfigInterface<any, any> = {
  nodeSize: d => d.nodeSize,
  nodeShape: d => d.shape,
  nodeGaugeValue: d => d.totalScore || d.score || 50 + 50 * Math.random(),
  nodeGaugeFill: d => _sample(['#ffc226', '47e845']),
  nodeIcon: d => d.icon,
  nodeLabel: d => d.label,
  nodeSubLabel: d => d.sublabel,
  layoutNodeGroup: d => d.group,
  nodeSideLabels: d => d.sideLabels,
  nodeDisabled: d => d.disabled,
  nodeEnterPosition: d => d.enterPosition,
  linkArrow: d => d.linkArrow,
  linkFlow: d => d.linkFlow,
  linkLabel: d => d.linkLabel,
  linkBandWidth: 0,
}

export const overviewConfig = (onNodeClick): GraphConfigInterface<any, any> => ({
  ...accessors,

  // Layout
  layoutType: GraphLayoutType.ParallelHorizontal,
  layoutGroupOrder: ['cCUSTOMER_EDGE', 'REGIONAL_EDGE', 'pCUSTOMER_EDGE'],

  // Events
  events: {
    [Graph.selectors.node]: {
      click: (d) => { onNodeClick(d) },
    },
  },
})

export const drilldownConfig = (onNodeClick?): GraphConfigInterface<any, any> => ({
  ...accessors,

  // Layout
  layoutType: GraphLayoutType.Force,

  // Events
  events: {
    [Graph.selectors.node]: {
      click: (d) => { onNodeClick?.(d) },
    },
  },
})
