// Copyright (c) Volterra, Inc. All rights reserved.
import _random from 'lodash/random'
import _sample from 'lodash/sample'
import _times from 'lodash/times'
import _uniqueId from 'lodash/uniqueId'
import { LinkStyle, LinkArrow, NodeDatumCore, LinkDatumCore, CircleLabel } from '@volterra/vis'

interface NodeDatum extends NodeDatumCore {
  shape: string;
  status: string;
  score: number;
  group: string;
  borderWidth: number;
  label: string;
  sublabel: string;
  labelIcon: string;
  nodeSize: number;
  fill: string;
  icon: string;
  iconSize: number;
  sideLabels: CircleLabel[];
  disabled: boolean;
  alerts: string[];
}

interface LinkDatum extends LinkDatumCore {
  alerts: string[];
  status: string;
  linkArrow: LinkArrow;
  label: string;
  linkWidth: number;
  bandWidth: number;
  linkStyle: LinkStyle;
  linkFlow: boolean;
  linkLabel: CircleLabel;
}

const status = ['alert', 'healthy', 'warning', 'inactive']
// const position = ['top', 'left', 'right']
const group = ['Site 1', 'Site 2', 'Site 3']
const shape = ['circle', 'square', 'hexagon', 'triangle']

const glyphs = {
  aws: '☁︎',
  azure: '☂︎',
  gcp: '♛',
  physical: '♜',
}

const statusGlyphs = {
  warning: '⚠️',
  warn2: '&#xe96c;',
}

export function randomLink (node1: NodeDatum, node2: NodeDatum): LinkDatum {
  return {
    id: `${node1.id}::${node2.id}`,
    source: node1.id,
    alerts: ['This is a link'],
    target: node2.id,
    status: _sample(status),
    linkArrow: _sample([LinkArrow.Single, LinkArrow.Double]),
    label: `link ${node1.id} ${node2.id}`,
    linkWidth: _sample([null, 1, 2]),
    bandWidth: _sample([null, 5, 7, 10, 12, 15]),
    linkStyle: LinkStyle.Solid,
    linkFlow: true, // _sample([false, true, true, true, true]),
    linkLabel: _sample([undefined, {
      text: _random(1, 50),
      color: _sample(['#2186d1', '#fdc739', '#fb3715', null]),
    }]),
  }
}

export function generateRandomLinks (nodes: NodeDatum[], count: number): LinkDatum[] {
  if (nodes.length < 2) return
  const links = _times(count, () => {
    const node1 = _sample(nodes)
    let node2
    do {
      node2 = _sample(nodes)
    } while (node2 === node1)

    const link = randomLink(node1, node2)
    // node1.links.push(link)
    return link
  })
  return links
}

export function randomNode (): NodeDatum {
  const id = _uniqueId()
  const nodeShape = _sample(shape)
  const nodeStatus = _sample(status)

  const statusMap = {
    healthy: { color: '#47e845' },
    warning: { color: '#ffc226' },
    inactive: { color: '#dddddd' },
    alert: { color: '#f88080' },
  }

  return {
    shape: nodeShape,
    id: id,
    status: nodeStatus,
    score: (Math.random() < 0.5 ? _random(0, 100) : 0),
    group: _sample(group),
    borderWidth: nodeShape === 'square' ? 1 : 5,
    label: `Site ${id}`,
    sublabel: _sample(['sublabel', undefined]),
    labelIcon: nodeStatus === 'danger' ? _sample(statusGlyphs) : null,
    nodeSize: nodeShape === 'square' ? 45 : 65,
    icon: nodeShape === 'square' ? 'RE' : _sample(glyphs),
    iconSize: nodeShape === 'square' ? 28 : 70 / 2.5 * 2,
    sideLabels: _times(Math.random() < 0.3 ? _random(0, 3) : 0, n => ({
      text: _random(1, 50),
      color: _sample(['#2186d1', '#fdc739', '#fb3715', null]),
    })),
    fill: statusMap[nodeStatus].color,
    disabled: Math.random() < 0.1,
    alerts: [
      '⚠️ Your configuration has expired',
      '🆘 Node is down',
    ],
  }
}

export function * dataGenerator (): Generator<{
  nodes: NodeDatum[];
  links: LinkDatum[];
}, {
  nodes: NodeDatum[];
  links: LinkDatum[];
}, unknown> {
  while (true) {
    const numNodes = _random(5, 15)
    const nodes = _times(numNodes, randomNode)
    const links = generateRandomLinks(nodes, Math.round(numNodes / 1.5))

    yield { nodes, links }
  }
}
