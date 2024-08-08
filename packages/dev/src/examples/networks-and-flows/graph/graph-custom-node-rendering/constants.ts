import { CustomGraphNodeType, CustomGraphNodeStatus } from './enums'

export const DEFAULT_NODE_SIZE = 20
export const DEFAULT_CIRCLE_LABEL_SIZE = 7
export const NODE_STAR_ICON_ID = 'starIcon'

export const nodeTypeIconMap = new Map<CustomGraphNodeType, string>([
  [CustomGraphNodeType.Identity, '#identityIcon'], /* The icon ids come from SVG icon files */
  [CustomGraphNodeType.Network, '#networkIcon'],
  [CustomGraphNodeType.Resource, '#resourceIcon'],
  [CustomGraphNodeType.Compute, '#computeIcon'],
  [CustomGraphNodeType.Secret, '#secretIcon'],
  [CustomGraphNodeType.Finding, '#findingIcon'],
  [CustomGraphNodeType.ThreatActor, '#threatActorIcon'],
])

export const nodeTypeColorMap = new Map<CustomGraphNodeType, string>([
  [CustomGraphNodeType.Identity, 'var(--unovis-graph-node-identity)'],
  [CustomGraphNodeType.Network, 'var(--unovis-graph-node-network)'],
  [CustomGraphNodeType.Resource, 'var(--unovis-graph-node-resource)'],
  [CustomGraphNodeType.Compute, 'var(--unovis-graph-node-compute)'],
  [CustomGraphNodeType.Secret, 'var(--unovis-graph-node-secret)'],
  [CustomGraphNodeType.Finding, 'var(--unovis-graph-node-finding)'],
  [CustomGraphNodeType.ThreatActor, 'var(--unovis-graph-node-threat-actor)'],
])

export const nodeStatusIconMap = new Map<CustomGraphNodeStatus, string>([
  [CustomGraphNodeStatus.Admin, '#adminIcon'], /* The icon ids come from SVG icon files */
  [CustomGraphNodeStatus.Crown, '#crownIcon'],
  [CustomGraphNodeStatus.Public, '#publicIcon'],
  [CustomGraphNodeStatus.HighDataAccess, '#highDataAccessIcon'],
])
