import _sample from 'lodash-es/sample'
import _flatten from 'lodash-es/flatten'
import _findKey from 'lodash-es/findKey'
import _times from 'lodash-es/times'
import _groupBy from 'lodash-es/groupBy'

interface SankeyRecord {
  src: string;
  balancer: string;
  dest: string;
  flow: number;
}

interface SankeyNode {
  id: string;
  type: string;
  label: string;
  sublabel: string;
}

interface SankeyLink {
  source: string;
  target: string;
  flow: number;
  record: SankeyRecord;
}

export const randomRecord = (sources: string[], middle: string[], targets: string[]): SankeyRecord => ({
  src: _sample(sources),
  balancer: _sample(middle),
  dest: _sample(targets),
  flow: Math.round(150 * Math.random()),
})

export const recordsToNodes = (data: SankeyRecord[]): { nodes: SankeyNode[]; links: SankeyLink[] } => {
  const multilinks = _flatten(
    data.map(d => [
      { source: d.src, target: d.balancer, flow: d.flow, record: d },
      { source: d.balancer, target: d.dest, flow: d.flow, record: d },
    ])
  )

  const grouped = _groupBy(multilinks, l => `${l.source}-${l.target}`)
  const links = Object.keys(grouped).map(key => {
    const group = grouped[key]
    return {
      ...group[0],
      flow: group.reduce((acc, d) => acc + d.flow, 0),
    }
  })

  const nodes = {}
  links.forEach(l => {
    const { source, target, record } = l
    if (!source || !target) return
    const nodeNames = [source, target]
    nodeNames.forEach(nodeName => {
      const type = _findKey(record, (key) => key.toString() === nodeName)

      if (!nodes[nodeName]) {
        nodes[nodeName] = {
          id: nodeName,
          type,
          label: nodeName,
          sublabel: Math.random() > 0.8 ? 'sublabel' : '',
        }
      }
    })
  })

  return { nodes: Object.values(nodes), links }
}

export function sankeySampleData (n: number, sources: string[], middle: string[], targets: string[]): { nodes: SankeyNode[]; links: SankeyLink[] } {
  return recordsToNodes(
    _times(n, () => randomRecord(sources, middle, targets))
  )
}
