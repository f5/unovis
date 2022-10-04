import { GraphNodeShape, GraphPanelConfig } from '@unovis/ts'

enum Status { Healthy = 'healthy', Warning = 'warning', Inactive = 'inactive', Alert = 'alert'}

export const StatusMap = {
  [Status.Healthy]: { color: '#47e845', text: '&#xf00c;' },
  [Status.Warning]: { color: '#ffc226', text: '&#xf071;' },
  [Status.Inactive]: { color: '#dddddd', text: '&#xf00d;' },
  [Status.Alert]: { color: '#f88080', text: '&#x21;' },
}

export type NodeDatum = {
  id: string;
  group: string;
  subgroup: string;
  label: string;
  site: string;
  shape: GraphNodeShape;
  children?: NodeDatum[];
  icon?: string;
  score?: number;
  status?: string;
  sublabel?: string;
}

export type LinkDatum = {
  source: string;
  target: string;
  sourceGroup: string;
  targetGroup: string;
  status: Status;
  showTraffic: boolean;
}

type SiteConfig = {
  groupNodeId: string;
  panel: GraphPanelConfig;
}

export const nodes = [
  {
    id: 'us01-casper-node',
    site: 'us01-casper',
    shape: GraphNodeShape.Circle,
    icon: '&#xf0ac;',
    label: 'us01-casper',
    group: 'us01-casper',
    subgroup: 'us01-casper',
    children: [
      {
        id: 'N:site-local-vn,us01-casper',
        site: 'us01-casper',
        status: Status.Healthy,
        score: 87,
        icon: '&#xf542;',
        shape: GraphNodeShape.Square,
        label: 'site-local-vn',
        group: 'us01-casper',
        subgroup: 'us01-casper',
        groupLabel: 'us01-casper',
      },
      {
        id: 'S:NAME-UNAVAILABLE,us01-casper',
        site: 'us01-casper',
        status: Status.Healthy,
        score: 92,
        shape: GraphNodeShape.Hexagon,
        label: 'NAME-UNAVAILABLE',
        group: 'us01-casper',
        subgroup: 'us01-casper',
        groupLabel: 'us01-casper',
      },
      {
        id: 'S:checkoutservice,us01-casper',
        site: 'us01-casper',
        status: Status.Healthy,
        score: 96,
        icon: '',
        shape: GraphNodeShape.Hexagon,
        label: 'checkoutservice',
        group: 'us01-casper',
        subgroup: 'us01-casper',
        groupLabel: 'us01-casper',
      },
      {
        id: 'S:frontend,us01-casper',
        site: 'us01-casper',
        status: Status.Healthy,
        score: 100,
        icon: '',
        shape: GraphNodeShape.Hexagon,
        label: 'frontend',
        group: 'us01-casper',
        subgroup: 'us01-casper',
        groupLabel: 'us01-casper',
      },
      {
        id: 'S:recommendationservice,us01-casper',
        site: 'us01-casper',
        status: Status.Healthy,
        score: 100,
        icon: '',
        shape: GraphNodeShape.Hexagon,
        label: 'recommendationservice',
        group: 'us01-casper',
        subgroup: 'us01-casper',
        groupLabel: 'us01-casper',
      },
      {
        id: 'S:cartservice,us01-casper',
        site: 'us01-casper',
        status: Status.Warning,
        score: 77,
        icon: '',
        shape: GraphNodeShape.Hexagon,
        label: 'cartservice',
        group: 'us01-casper',
        subgroup: 'us01-casper',
        groupLabel: 'us01-casper',
      },
      {
        id: 'S:shippingservice,us01-casper',
        site: 'us01-casper',
        status: Status.Healthy,
        score: 100,
        icon: '',
        shape: GraphNodeShape.Hexagon,
        label: 'shippingservice',
        group: 'us01-casper',
        subgroup: 'us01-casper',
        groupLabel: 'us01-casper',
      },
      {
        id: 'S:currencyservice,us01-casper',
        site: 'us01-casper',
        status: Status.Healthy,
        score: 100,
        icon: '',
        shape: GraphNodeShape.Hexagon,
        label: 'currencyservice',
        group: 'us01-casper',
        subgroup: 'us01-casper',
        groupLabel: 'us01-casper',
      },
      {
        id: 'S:emailservice,us01-casper',
        site: 'us01-casper',
        status: Status.Healthy,
        score: 100,
        icon: '',
        shape: GraphNodeShape.Hexagon,
        label: 'emailservice',
        group: 'us01-casper',
        subgroup: 'us01-casper',
        groupLabel: 'us01-casper',
      },
      {
        id: 'S:paymentservice,us01-casper',
        site: 'us01-casper',
        status: Status.Healthy,
        score: 100,
        icon: '',
        shape: GraphNodeShape.Hexagon,
        label: 'paymentservice',
        group: 'us01-casper',
        subgroup: 'us01-casper',
        groupLabel: 'us01-casper',
      },
      {
        id: 'S:productcatalogservice,us01-casper',
        site: 'us01-casper',
        status: Status.Healthy,
        score: 100,
        icon: '',
        shape: GraphNodeShape.Hexagon,
        label: 'productcatalogservice',
        group: 'us01-casper',
        subgroup: 'us01-casper',
        groupLabel: 'us01-casper',
      },
    ],
  },
  {
    id: 'ca01-van-node',
    site: 'ca01-van',
    shape: GraphNodeShape.Circle,
    icon: '&#xf233;',
    label: 'ca01-van',
    group: 'west',
    subgroup: 'ca01-van',
    children: [
      {
        id: 'S:cartservice,ca01-van',
        site: 'ca01-van',
        status: Status.Inactive,
        score: 0,
        icon: '',
        shape: GraphNodeShape.Hexagon,
        label: 'redis-cart',
        group: 'west',
        subgroup: 'ca01-van',
        groupLabel: 'ca01-van',
      },
      {
        id: 'S:adservice,ca01-van',
        site: 'ca01-van',
        status: Status.Alert,
        score: 44,
        icon: '',
        shape: GraphNodeShape.Hexagon,
        label: 'adservice',
        group: 'west',
        subgroup: 'ca01-van',
        groupLabel: 'ca01-van',
      },
    ],
  },
  {
    id: 'us02-nyc-node',
    site: 'us02-nyc',
    shape: GraphNodeShape.Square,
    icon: '&#xf0c2;',
    label: 'us02-nyc',
    sublabel: '',
    group: 'west',
    subgroup: 'us02-nyc',
    children: [
      {
        id: 'N:public,us02-nyc',
        site: 'us02-nyc',
        status: Status.Alert,
        score: 66,
        shape: GraphNodeShape.Square,
        icon: '&#xf542;',
        label: 'public',
        group: 'west',
        subgroup: 'us02-nyc',
        groupLabel: 'us02-nyc',
      },
    ],
  },
  {
    id: 'uk01-sur-node',
    site: 'uk01-sur',
    shape: GraphNodeShape.Square,
    icon: '&#xf0c2;',
    label: 'uk01-sur',
    group: 'west',
    subgroup: 'uk01-sur',
    children: [
      {
        id: 'N:public,uk01-sur',
        site: 'uk01-sur',
        status: Status.Warning,
        score: 82,
        icon: '&#xf542;',
        shape: GraphNodeShape.Square,
        label: 'public',
        group: 'west',
        subgroup: 'uk01-sur',
        groupLabel: 'uk01-sur',
      },
    ],
  },
  {
    id: 'eu1-par-node',
    site: 'eu1-par',
    shape: GraphNodeShape.Square,
    icon: '&#xf233;',
    label: 'eu1-par',
    group: 'east',
    subgroup: 'eu1-par',
    children: [
      {
        id: 'N:public,eu1-par',
        site: 'eu1-par',
        status: Status.Warning,
        score: 78,
        icon: '&#xf542;',
        shape: GraphNodeShape.Square,
        label: 'public',
        group: 'east',
        subgroup: 'eu1-par',
        groupLabel: 'eu1-par',
      },
    ],
  },
  {
    id: 'eu2-mun-node',
    site: 'eu2-mun',
    shape: GraphNodeShape.Square,
    icon: '&#xf233;',
    label: 'eu2-mun',
    group: 'east',
    subgroup: 'eu2-mun',
    children: [
      {
        id: 'N:public,eu2-mun',
        site: 'eu2-mun',
        status: Status.Healthy,
        score: 99,
        icon: '&#xf542;',
        shape: GraphNodeShape.Square,
        label: 'public',
        group: 'east',
        subgroup: 'eu2-mun',
        groupLabel: 'eu2-mun',
      },
    ],
  },
  {
    id: 'eu3-pra-node',
    site: 'eu3-pra',
    shape: GraphNodeShape.Square,
    icon: '&#xf233;',
    label: 'eu3-pra',
    sublabel: '',
    group: 'east',
    subgroup: 'eu3-pra',
    children: [
      {
        id: 'N:public,eu3-pra',
        site: 'eu3-pra',
        status: Status.Alert,
        score: 60,
        icon: '&#xf542;',
        shape: GraphNodeShape.Square,
        label: 'public',
        group: 'east',
        subgroup: 'eu3-pra',
        groupLabel: 'eu3-pra',
      },
    ],
  },
  {
    id: 'ch1-lan-node',
    site: 'ch1-lan',
    shape: GraphNodeShape.Square,
    icon: '&#xf233;',
    label: 'ch1-lan',
    sublabel: '',
    group: 'east',
    subgroup: 'ch1-lan',
    children: [
      {
        id: 'N:public,ch1-lan',
        site: 'ch1-lan',
        status: Status.Healthy,
        score: 91,
        icon: '&#xf542;',
        shape: GraphNodeShape.Square,
        label: 'public',
        group: 'east',
        subgroup: 'ch1-lan',
        groupLabel: 'ch1-lan',
      },
    ],
  },
]

export const links = [
  {
    target: 'S:cartservice,ca01-van',
    source: 'N:site-local-vn,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:cartservice,ca01-van',
    source: 'S:NAME-UNAVAILABLE,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:shippingservice,us01-casper',
    source: 'S:checkoutservice,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:paymentservice,us01-casper',
    source: 'S:checkoutservice,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:emailservice,us01-casper',
    source: 'S:checkoutservice,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:productcatalogservice,us01-casper',
    source: 'S:checkoutservice,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:cartservice,us01-casper',
    source: 'S:checkoutservice,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:currencyservice,us01-casper',
    source: 'S:checkoutservice,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:recommendationservice,us01-casper',
    source: 'S:frontend,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:shippingservice,us01-casper',
    source: 'S:frontend,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:adservice,ca01-van',
    source: 'S:frontend,us01-casper',
    label: 'frontend &#8594; adservice',
    status: Status.Healthy,
  },
  {
    target: 'S:checkoutservice,us01-casper',
    source: 'S:frontend,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:cartservice,us01-casper',
    source: 'S:frontend,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:currencyservice,us01-casper',
    source: 'S:frontend,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:productcatalogservice,us01-casper',
    source: 'S:frontend,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:productcatalogservice,us01-casper',
    source: 'S:recommendationservice,us01-casper',
    status: Status.Healthy,
  },
  {
    target: 'S:cartservice,ca01-van',
    source: 'S:cartservice,us01-casper',
    status: Status.Warning,
  },
  {
    target: 'S:frontend,us01-casper',
    source: 'N:public,us02-nyc',
    status: Status.Healthy,
  },
  {
    target: 'S:frontend,us01-casper',
    source: 'N:public,uk01-sur',
    status: Status.Healthy,
  },
  {
    target: 'S:frontend,us01-casper',
    source: 'N:public,eu1-par',
    status: Status.Healthy,
  },
  {
    target: 'S:frontend,us01-casper',
    source: 'N:public,eu2-mun',
    status: Status.Healthy,
  },
  {
    target: 'S:frontend,us01-casper',
    source: 'N:public,eu3-pra',
    status: Status.Alert,
  },
  {
    target: 'S:frontend,us01-casper',
    source: 'N:public,ch1-lan',
    status: Status.Healthy,
  },
].map(l => ({
  ...l,
  showTraffic: l.status !== 'alert',
  sourceGroup: nodes.find(n => n.children.map(c => c.id).includes(l.source))?.site,
  targetGroup: nodes.find(n => n.children.map(c => c.id).includes(l.target))?.site,
}))

export const sites: Record<string, SiteConfig> = nodes.reduce((acc, curr) => ({
  ...acc,
  [curr.site]: {
    groupNodeId: curr.id,
    panel: {
      nodes: curr.children.map(d => d.id),
      label: curr.site,
      borderWidth: 4,
      padding: 15,
      dashedOutline: curr === nodes[0],
      sideIconFontSize: '20px',
      sideIconShape: GraphNodeShape.Circle,
      sideIconSymbol: curr.icon,
      sideIconShapeSize: 40,
    },
  },
}), {})
