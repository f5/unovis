export type NodeDatum = {
  id: string;
  group?: string;
  subGroup?: string;
  shape?: string;
}

export type LinkDatum = {
  source: string;
  target: string;
}

export const data = {
  nodes: [
    { id: 'vpc', icon: '&#xf0c2;' },
    { id: '192.168.0.0/25', group: 'us-east-2a', subGroup: 'subnets', icon: '&#xf233;' },
    { id: '192.168.3.192/26', group: 'us-east-2a', subGroup: 'subnets', icon: '&#xf233;' },
    { id: '192.8.3.191/33', group: 'us-east-2a', subGroup: 'subnets', icon: '&#xf233;' },
    { id: 'master-0', group: 'us-east-2a', subGroup: 'nodes', icon: '&#xf1b2;' },
    { id: 'workload-name', group: 'us-east-2a', subGroup: 'nodes', icon: '&#xf1b3;' },
  ],
  links: [
    { source: 'vpc', target: '192.168.0.0/25' },
    { source: 'vpc', target: '192.168.3.192/26' },
    { source: 'vpc', target: '192.8.3.191/33' },
    { source: '192.168.0.0/25', target: 'master-0' },
    { source: '192.168.3.192/26', target: 'master-0' },
    { source: '192.8.3.191/33', target: 'workload-name' },
  ],
}

export const panels = [
  {
    nodes: ['192.168.0.0/25', '192.168.3.192/26', '192.8.3.191/33', 'master-0', 'workload-name'],
    label: 'us-east-2a',
    dashedOutline: true,
    padding: { top: 45, right: 30, bottom: 30, left: 30 },
  },
  {
    nodes: ['192.168.0.0/25', '192.168.3.192/26', '192.8.3.191/33'],
    label: 'subnets',
    padding: { top: 5 },
  },
  {
    nodes: ['master-0', 'workload-name'],
    label: 'workload',
    padding: { top: 5 },
  },
]
