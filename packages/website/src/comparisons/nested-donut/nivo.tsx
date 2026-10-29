import React from 'react'
import { ResponsiveSunburst } from '@nivo/sunburst'

import type { ChartProps } from '../types'
import { DataRecord, formatValue } from './data'

type Node = { id: string; name: string; value?: number; children?: Node[] }

// The sunburst takes a tree, and Nivo adds the leaf values up for the parents. Every node needs a unique `id`,
// and browser names repeat, so the id is the node's path
function toTree (rows: DataRecord[], levels: ((d: DataRecord) => string)[], parent: string): Node[] {
  const [level, ...rest] = levels
  const names = [...new Set(rows.map(level))]
  return names.map(name => {
    const id = `${parent}/${name}`
    const children = rows.filter(d => level(d) === name)
    return rest.length ? { id, name, children: toTree(children, rest, id) } : { id, name, value: children[0].sessions }
  })
}

export default function NivoNestedDonutChart ({ data, isDark }: ChartProps<DataRecord[]>): JSX.Element {
  return (
    <ResponsiveSunburst<Node>
      data={{ id: 'Sessions', name: 'Sessions', children: toTree(data, [d => d.platform, d => d.os, d => d.browser], 'Sessions') }}
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      valueFormat={formatValue}
      borderColor={isDark ? '#1b1b1d' : 'white'}
      enableArcLabels
      arcLabel={d => d.data.name}
      // Skips the labels of segments narrower than 10 degrees
      arcLabelsSkipAngle={10}
      // The default tooltip shows the `id`, the path here. The arc labels keep their dark default color in dark mode too,
      // which reads on the light segment colors
      tooltip={d => (
        <div style={{ padding: '5px 9px', background: isDark ? '#222' : 'white', color: isDark ? '#ccc' : 'inherit', boxShadow: 'rgba(0, 0, 0, 0.25) 0px 1px 2px' }}>
          <strong>{d.data.name}</strong>: {d.formattedValue}
        </div>
      )}
    />
  )
}
