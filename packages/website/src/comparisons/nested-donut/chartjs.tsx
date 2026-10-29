import React from 'react'
import { Chart, ArcElement, Tooltip } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Doughnut } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, formatValue } from './data'

Chart.register(ArcElement, Tooltip)

// The Colors plugin would give every segment of every ring a color of its own, so the segments get the color of their
// platform from its palette by hand
const colors = ['rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(255, 159, 64)']

type Ring = { names: string[]; values: number[]; colors: string[]; weight: number }

// Chart.js has no hierarchical chart: every ring is a doughnut dataset of its own, and the segments line up because each
// ring lists its groups in the same order and adds up to the same total
function getRing (data: DataRecord[], path: (d: DataRecord) => string[], weight: number): Ring {
  const platforms = [...new Set(data.map(d => d.platform))]
  const groups = new Map<string, { name: string; value: number; platform: string }>()
  data.forEach(d => {
    const names = path(d)
    const key = names.join('/')
    const group = groups.get(key) ?? { name: names[names.length - 1], value: 0, platform: d.platform }
    group.value += d.sessions
    groups.set(key, group)
  })
  const list = [...groups.values()]
  return {
    names: list.map(g => g.name),
    values: list.map(g => g.value),
    colors: list.map(g => colors[platforms.indexOf(g.platform) % colors.length]),
    weight,
  }
}

export default function ChartJsNestedDonutChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const widths = preset === 'widths'
  // `weight` sets a ring's width relative to the others
  const platformRing = getRing(data, d => [d.platform], widths ? 2 : 1)
  const osRing = getRing(data, d => [d.platform, d.os], widths ? 3 : 1)
  const browserRing = getRing(data, d => [d.platform, d.os, d.browser], widths ? 6 : 1)
  // The first dataset is the outer ring
  const rings = preset === 'inwards' ? [platformRing, osRing, browserRing] : [browserRing, osRing, platformRing]

  return (
    <Doughnut
      // Registered for this chart only: with `Chart.register`, every Chart.js chart on the site would get data labels
      plugins={[ChartDataLabels]}
      data={{
        datasets: rings.map(ring => ({ data: ring.values, backgroundColor: ring.colors, weight: ring.weight })),
      }}
      options={{
        maintainAspectRatio: false,
        // Degrees, clockwise from 12 o'clock
        rotation: preset === 'half' ? -90 : 0,
        circumference: preset === 'half' ? 180 : 360,
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => `${rings[ctx.datasetIndex].names[ctx.dataIndex]}: ${formatValue(ctx.parsed)}`,
            },
          },
          // `display: 'auto'` hides labels that overlap others
          datalabels: {
            display: 'auto',
            formatter: (_, ctx) => rings[ctx.datasetIndex].names[ctx.dataIndex],
            color: isDark ? '#fff' : '#333',
          },
        },
      }}
    />
  )
}
