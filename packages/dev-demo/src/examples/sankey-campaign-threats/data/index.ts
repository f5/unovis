import _uniqBy from 'lodash/uniqBy'
import _partition from 'lodash/partition'
import _orderBy from 'lodash/orderBy'
import _countBy from 'lodash/countBy'
import threats from './data.json'

export type RawDatum = typeof threats[0]

export const vars = ['threat_campaigns.name', 'user', 'src_ip', 'country', 'vh_name']

export type NodeDatum = {
  id: string;
  label: string;
  allow: number;
  block: number;
}

export type LinkDatum = {
  source: string;
  target: string;
}

export type SankeyData = {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

export type TimelineDatum = {
  time: Date;
  event: Record<string, string>;
}

export function getNodes (data: RawDatum[], key: string): NodeDatum[] {
  return _uniqBy(data, key).map(n => {
    const items = _partition(data.filter(d => d[key] === n[key]), i => i.action === 'block')
    return {
      id: n[key],
      label: n[key],
      allow: items[1].length,
      block: items[0].length,
    }
  })
}

export const groups: Record<string, NodeDatum[]> = vars.reduce((acc, k) => ({
  ...acc,
  [k]: getNodes(threats, k),
}), {})

export const timelineData = _orderBy(
  threats.map(d => ({ time: new Date(d['@timestamp']), event: d })),
  t => _countBy(threats, 'threat_campaigns.name')[t.event['threat_campaigns.name']],
  'desc'
)

export function getData (keys: string[], vals: Record<string, string>, dateRange?: [number, number], action?: 'block' | 'allow'): SankeyData {
  const inRange = (start: number, end: number, val: number): boolean => {
    return start <= val && val <= end
  }
  const data = threats.filter(d => {
    if (dateRange && !inRange(...dateRange, new Date(d['@timestamp']).valueOf())) {
      return false
    }
    if (action && d.action !== action) {
      return false
    }
    return keys.reduce((acc, k) => vals[k] ? d[k] === vals[k] && acc : acc, true)
  })
  const links = []
  const nodes = []
  const layers = keys.map(k => getNodes(data, k))
  layers.forEach((lyr, i) => {
    lyr.forEach(item => {
      nodes.push(item)
      if (i !== 0) {
        layers[i - 1].forEach(prev => {
          const ls = data.filter(d => d[keys[i]] === item.id && d[keys[i - 1]] === prev.id)
          if (ls.length) {
            links.push({
              source: prev.id,
              target: item.id,
              value: ls.length,
            })
          }
        })
      }
    })
  })
  return {
    nodes, links,
  }
}
