import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule, AgDonutSeriesOptions } from 'ag-charts-community'

import type { ChartProps } from '../types'
import { DataRecord, formatValue } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

// The first colors of AG Charts' palette, one per platform: the theme would give every sector of every ring a color
// of its own
const colors = ['#5090dc', '#ffa03a', '#459d55']

type Segment = { name: string; value: number }
type Ring = { segments: Segment[]; fills: string[] }

// The Sunburst series is Enterprise-only, so every ring is a donut series of its own, and the segments line up
// because each ring lists its groups in the same order and adds up to the same total
function getRing (data: DataRecord[], path: (d: DataRecord) => string[]): Ring {
  const platforms = [...new Set(data.map(d => d.platform))]
  const groups = new Map<string, Segment & { platform: string }>()
  data.forEach(d => {
    const names = path(d)
    const key = names.join('/')
    const group = groups.get(key) ?? { name: names[names.length - 1], value: 0, platform: d.platform }
    group.value += d.sessions
    groups.set(key, group)
  })
  const list = [...groups.values()]
  return {
    segments: list.map(({ name, value }) => ({ name, value })),
    fills: list.map(g => colors[platforms.indexOf(g.platform) % colors.length]),
  }
}

// Ring edges as ratios of the chart's radius, from the middle out; "Ring widths" makes the outer ring the widest
const equalEdges = [0.25, 0.5, 0.75, 1]
const widthEdges = [0.25, 0.39, 0.59, 1]

export default function AgChartsNestedDonutChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const edges = preset === 'widths' ? widthEdges : equalEdges
  const rings = [
    getRing(data, d => [d.platform]),
    getRing(data, d => [d.platform, d.os]),
    getRing(data, d => [d.platform, d.os, d.browser]),
  ]
  // The platforms in the middle by default; "Inwards" puts them on the outer ring
  const order = preset === 'inwards' ? [2, 1, 0] : [0, 1, 2]

  const series: AgDonutSeriesOptions[] = rings.map((ring, i) => ({
    type: 'donut',
    data: ring.segments,
    angleKey: 'value',
    sectorLabelKey: 'name',
    // Off, or the legend would merge the segments that share a name, like the browsers of different platforms
    showInLegend: false,
    innerRadiusRatio: edges[order[i]],
    outerRadiusRatio: edges[order[i] + 1],
    fills: ring.fills,
    strokes: [isDark ? '#1b1b1d' : '#fff'],
    strokeWidth: 1,
    sectorLabel: { color: '#fff' },
    tooltip: {
      renderer: ({ datum }) => ({ title: (datum as Segment).name, data: [{ label: 'Sessions', value: formatValue((datum as Segment).value) }] }),
    },
  }))

  return (
    <AgCharts
      style={{ height: '100%' }}
      options={{
        theme: isDark ? 'ag-default-dark' : 'ag-default',
        background: { visible: false },
        series,
      }}
    />
  )
}
