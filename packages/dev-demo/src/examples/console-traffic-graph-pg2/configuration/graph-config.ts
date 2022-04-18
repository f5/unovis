import _uniq from 'lodash/uniq'
import { Graph, GraphLayoutType, GraphConfigInterface, Shape, GraphPanelConfigInterface } from '@volterra/vis'

// eslint-disable-next-line @typescript-eslint/naming-convention
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
  nodeIcon: d => d.icon,
  nodeLabel: d => d.label,
  nodeSubLabel: d => d.sublabel,
  nodeGroup: d => d.group,
  nodeSideLabels: d => d.sideLabels,
  nodeDisabled: d => d.disabled,
  nodeFill: d => d.fill,
  linkArrow: l => l.linkArrow,
  linkFlow: l => l.showTraffic,
  linkLabel: l => l.linkLabel,
  linkStroke: l => l.score === 100 ? 'rgba(49, 208, 49, 0.500)' : null,
  linkBandWidth: 12,
  layoutSubgroupMaxNodes: 6,
  layoutGroupRows: 1,

  attributes: {
    [Graph.selectors.panel]: {
      'ves-graph-panel': (p: GraphPanelConfigInterface) => p.label,
    },
    [Graph.selectors.panelSelection]: {
      'ves-graph-panel-selection': '',
    },
    [Graph.selectors.panelRect]: {
      'ves-graph-panel-rect': '',
    },
  },
}

export const overviewConfig = (data, onNodeClick): GraphConfigInterface<any, any> => ({
  ...accessors,

  // Layout
  layoutType: GraphLayoutType.Parallel,
  layoutGroupOrder: ['column1', 'ce01-ashburn-aws', 'column3'],
  layoutNonConnectedAside: false,

  // Events
  events: {
    [Graph.selectors.node]: {
      click: (d) => { onNodeClick(d) },
    },
  },

  // Panels
  panels: [],
})

export const getPanels = (data): GraphPanelConfigInterface[] => _uniq(data.nodes.map(d => d.site)).map(label => ({
  label,
  nodes: data.nodes.filter(d => d.site === label).map(d => d.id),
  color: '#333',
  borderWidth: 1,
  padding: 15,
  selectionOutline: label === 'ce01-ashburn-aws',

  sideLabelIcon: label === 'ce01-ashburn-aws' ? '&#xe9a0;'
    : label === 'ce02-paris-azure' ? '&#xe9a2;'
      : '&#xe946;',
  sideLabelShape: ((label === 'ce01-ashburn-aws') || (label === 'ce02-paris-azure')) ? Shape.Circle : Shape.Square,
  sideLabelColor: label === 'ce01-ashburn-aws' ? StatusMap.healthy.color : '#acb2b9',
}))

export const drilldownConfig = (onNodeClick): GraphConfigInterface<any, any> => ({
  ...accessors,

  // Layout
  layoutType: GraphLayoutType.Force,

  // Events
  events: {
    [Graph.selectors.node]: {
      click: (d) => { onNodeClick(d) },
    },
  },
})
