export type GraphData = {
  nodes: CustomGraphNode[];
  links: CustomGraphLink[];
}

export enum CustomGraphNodeType {
  Identity = 'identity',
  Network = 'network',
  Resource = 'resource',
  Compute = 'compute',
  Secret = 'secret',
  Finding = 'finding',
  ThreatActor = 'threat-actor',
}

export enum CustomGraphNodeStatus {
  Admin = 'admin',
  Crown = 'crown',
  Public = 'public',
  HighDataAccess = 'high-data-access',
}

export const nodes: CustomGraphNode[] = [
  {
    id: '0',
    type: CustomGraphNodeType.Identity,
    subLabel: 'External User',
    label: 'jdoe@acme.com',
    aggregationCount: 2,
    numFindings: { medium: 12, high: 3, critical: 1 },
    numSessions: 150,
  },
  { id: '1', type: CustomGraphNodeType.Identity, subLabel: 'Role', label: 'AWSReservedSSO_Something' },
  { id: '2', type: CustomGraphNodeType.Network, subLabel: 'EC2 Instance', label: 'i-0a1b2c3d4e5f6g7h8' },
  { id: '3', type: CustomGraphNodeType.Network, subLabel: 'EC2 Instance', label: 'i-1a1b2c3d4e5f6g7h8' },
  { id: '4', type: CustomGraphNodeType.Resource, subLabel: 'File', label: 'my-file' },
  { id: '5', type: CustomGraphNodeType.Secret, subLabel: 'Secret', label: 'tests-ansible-ssm-file-transfer' },
]

export type CustomGraphData<
  N extends CustomGraphNode = CustomGraphNode,
  L extends CustomGraphLink = CustomGraphLink,
> = {
  links: L[];
  nodes: N[];
};

export type CustomGraphNode<Datum = unknown> = {
  id: string;
  datum?: Datum;
  fillColor?: string;
  label?: string;
  subLabel?: string;
  type?: CustomGraphNodeType;
  aggregationCount?: number;
  numFindings?: {
    low?: number;
    medium?: number;
    high?: number;
    critical?: number;
  };
  numSessions?: number;
  starred?: boolean;
  highlighted?: boolean;
  status?: ('admin' | 'crown' | 'public' | 'high-data-access' | 'eof' | 'egress' | 'ingress')[];
};

export type CustomGraphLink<Datum = unknown> = {
  source: string;
  target: string;
  bandWidth?: number;
  datum?: Datum;
  id?: string;
  label?: string;
  showArrow?: boolean;
  showFlow?: boolean;
  width?: number;
  linkFlowAnimDuration?: number;
  linkFlowParticleSize?: number;
  linkFlowParticleSpeed?: number;
};

export type CustomGraphSwimlane = {
  index: number;
  label: string;
  x1: number;
  x2: number;
  xCenter: number;
  xMax: number;
  xMin: number;
};


const links: CustomGraphLink[] = [
  { source: '0', target: '1', showFlow: true, linkFlowParticleSize: 1.5, linkFlowParticleSpeed: 15 },
  { source: '0', target: '2', showFlow: true, linkFlowParticleSize: 2, linkFlowParticleSpeed: 25 },
  { source: '0', target: '3', showFlow: true, linkFlowParticleSize: 3, linkFlowParticleSpeed: 10 },
  { source: '0', target: '4', showFlow: true, linkFlowParticleSize: 3, linkFlowParticleSpeed: 30 },
  { source: '1', target: '5', showFlow: true, linkFlowParticleSize: 2.5, linkFlowParticleSpeed: 20 },
]

export const data: GraphData = { nodes, links }

export const DEFAULT_NODE_SIZE = 20
export const DEFAULT_CIRCLE_LABEL_SIZE = 7
export const NODE_STAR_ICON_ID = 'starIcon'

export const nodeTypeColorMap = new Map<CustomGraphNodeType, string>([
  [CustomGraphNodeType.Identity, 'var(--unovis-graph-node-identity)'],
  [CustomGraphNodeType.Network, 'var(--unovis-graph-node-network)'],
  [CustomGraphNodeType.Resource, 'var(--unovis-graph-node-resource)'],
  [CustomGraphNodeType.Compute, 'var(--unovis-graph-node-compute)'],
  [CustomGraphNodeType.Secret, 'var(--unovis-graph-node-secret)'],
  [CustomGraphNodeType.Finding, 'var(--unovis-graph-node-finding)'],
  [CustomGraphNodeType.ThreatActor, 'var(--unovis-graph-node-threat-actor)'],
])
