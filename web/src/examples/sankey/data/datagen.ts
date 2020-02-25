// Copyright (c) Volterra, Inc. All rights reserved.
import _sample from 'lodash/sample'
import _flatten from 'lodash/flatten'
import _findKey from 'lodash/findKey'
import _times from 'lodash/times'
import _groupBy from 'lodash/groupBy'

export const randomRecord = (sources, middle, targets) => ({
  src: _sample(sources),
  balancer: _sample(middle),
  dest: _sample(targets),
  flow: Math.round(150 * Math.random()),
})

export const recordsToNodes = (data) => {
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
          links: [],
          type,
          label: nodeName,

        }
      }
    })
  })

  return { nodes: Object.values(nodes), links }
}

export function sankeySampleData (n: number, sources, middle, targets) {
  return recordsToNodes(
    _times(n, () => randomRecord(sources, middle, targets))
  )
}
