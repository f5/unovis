import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule, AgDonutSeriesOptions } from 'ag-charts-community'

import type { ChartProps } from '../types'
import { DataRecord, formatUsage, percentOfQuota, formatAverageUsage } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

// The first colors of AG Charts' palette, one per ring: the theme would give every sector of every ring a color of its own
const colors = ['#5090dc', '#ffa03a', '#459d55', '#34bfe1', '#e1cc00']

export default function AgChartsRadialBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // 16 px rings with 4 px gaps from the outer edge inward (28 and 4 px for the thick rings)
  const ringWidth = preset === 'thick' ? 28 : 16
  const ringGap = 4

  // The Radial Bar series is Enterprise-only, so every ring is a donut series of its own: the used share, then the
  // remainder as the track. The rings share one angle scale, so the values are percent of the quota
  const series: AgDonutSeriesOptions[] = data.map((d, i) => ({
    type: 'donut',
    // A legend click hides the sector at that index in every donut, so every ring lists all the shares, zero except
    // its own, and zero sectors are left out of the legend. The legend lists every sector, so the tracks get items too
    data: [
      ...data.map((r, j) => ({ label: r.label, value: i === j ? percentOfQuota(r) : 0 })),
      ...data.map((r, j) => ({ label: 'Unused', value: i === j ? 100 - percentOfQuota(r) : 0 })),
    ],
    angleKey: 'value',
    legendItemKey: 'label',
    hideZeroValueSectorsInLegend: true,
    // Ring edges in pixels from the outer edge of the chart
    outerRadiusRatio: 1,
    outerRadiusOffset: -i * (ringWidth + ringGap),
    innerRadiusRatio: 1,
    innerRadiusOffset: -i * (ringWidth + ringGap) - ringWidth,
    fills: [...colors, ...data.map(() => isDark ? '#444' : '#eee')],
    strokeWidth: 0,
    // Rounds the track too: a `cornerRadius` returned by an `itemStyler`, for the used share only, isn't drawn
    cornerRadius: preset === 'rounded' ? 8 : 0,
    // The middle of the innermost ring holds the label
    innerLabels: i === data.length - 1
      ? [{ text: formatAverageUsage(data), fontSize: 18, fontWeight: 'bold' }, { text: 'of the quotas used' }]
      : undefined,
    // A tooltip can't be turned off for one sector, so the track shows the ring's usage too
    tooltip: { renderer: () => ({ title: d.label, data: [{ label: 'Used', value: formatUsage(d) }] }) },
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
