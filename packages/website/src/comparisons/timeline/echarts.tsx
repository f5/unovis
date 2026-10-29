import React from 'react'
import ReactECharts from 'echarts-for-react'
import type { CustomSeriesRenderItem } from 'echarts'

import type { ChartProps } from '../types'
import { DAY, DEPLOYMENT_ICON_PATH, ICON_SIZE, INCIDENT_ICON_PATH, WEEK_END, WEEK_START } from './constants'
import { TimelineEvent, kinds, services, formatDay, formatRange, getKindLabel } from './data'

type Params = { data: { event?: TimelineEvent } }

export default function EChartsTimeline ({ data, isDark, preset }: ChartProps<TimelineEvent[]>): JSX.Element {
  // ECharts has no range bar series: its Gantt example draws every item with a custom series. `api.value(0)` is the row,
  // 1 and 2 are the start and the end
  const renderItem: CustomSeriesRenderItem = (_, api) => {
    const [x1, y] = api.coord([api.value(1), api.value(0)])
    const [x2] = api.coord([api.value(2), api.value(0)])
    const height = (api.size([0, 1]) as number[])[1] * 0.6
    const shape = { x: x1, y: y - height / 2, width: x2 - x1, height, r: preset === 'rounded' ? height / 2 : 0 }
    return { type: 'rect', transition: ['shape'], shape, style: { fill: api.visual('color') as string } }
  }
  const row = (d: TimelineEvent): number => services.indexOf(d.service)

  // Series with the same name share a legend item and a color, so the arrows and icons hide with their kind
  const arrows = {
    type: 'lines',
    name: getKindLabel('incident'),
    coordinateSystem: 'cartesian2d',
    symbol: ['none', 'arrow'],
    symbolSize: 8,
    lineStyle: { color: isDark ? '#ccc' : '#666', width: 1.5, opacity: 1 },
    silent: true,
    data: data.filter(d => d.causeId).map(d => {
      const cause = data.find(c => c.id === d.causeId)
      return { coords: [[cause.end, row(cause)], [d.start, row(d)]] }
    }),
  }
  const icons = [
    { kind: 'deployment' as const, path: DEPLOYMENT_ICON_PATH, x: (d: TimelineEvent) => d.end, offset: ICON_SIZE / 2 },
    { kind: 'incident' as const, path: INCIDENT_ICON_PATH, x: (d: TimelineEvent) => d.start, offset: -ICON_SIZE / 2 },
  ].map(icon => ({
    type: 'scatter',
    name: getKindLabel(icon.kind),
    symbol: `path://${icon.path}`,
    symbolSize: ICON_SIZE,
    symbolOffset: [icon.offset, 0],
    data: data.filter(d => d.kind === icon.kind).map(d => ({ value: [icon.x(d), row(d)], event: d })),
  }))

  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      notMerge
      option={{
        backgroundColor: 'transparent',
        tooltip: {
          formatter: ({ data: { event: d } }: Params) => d ? `<b>${d.title}</b><br/>${d.service} · ${getKindLabel(d.kind)}<br/>${formatRange(d)}` : '',
        },
        legend: { data: kinds.map(k => k.label) },
        xAxis: { type: 'time', min: WEEK_START, max: WEEK_END, interval: DAY, axisLabel: { formatter: (value: number) => formatDay(value) } },
        // The category axis lists its first item at the bottom, `inverse` puts it on top
        yAxis: { type: 'category', data: services, inverse: true },
        series: [
          ...kinds.map(k => ({
            type: 'custom',
            name: k.label,
            renderItem,
            encode: { x: [1, 2], y: 0 },
            data: data.filter(d => d.kind === k.key).map(d => ({ value: [row(d), d.start, d.end], event: d })),
          })),
          ...(preset === 'arrows' ? [arrows] : []),
          ...(preset === 'icons' ? icons : []),
        ],
      }}
    />
  )
}
