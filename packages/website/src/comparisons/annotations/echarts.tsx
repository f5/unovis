import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { CALLOUT_VALUE, GOAL, VALUE_MAX } from './constants'
import { Data, formatDay, formatEvent, formatValue } from './data'

export default function EChartsAnnotationsChart ({ data, isDark, preset }: ChartProps<Data>): JSX.Element {
  const { days, events, incident } = data

  // Every callout is a `markLine` from the day's value up to the callout row, with the text past its end. Labels wrap
  // at a fixed `width` with `overflow: 'break'`; rich text styles parts of a label
  const callouts = events.map(e => [
    { coord: [formatDay(e.date), e.users] },
    {
      coord: [formatDay(e.date), CALLOUT_VALUE],
      label: {
        formatter: preset === 'rich' ? `{title|${e.title}}\n${e.detail}` : formatEvent(e),
        rich: { title: { fontWeight: 'bold' } },
      },
    },
  ])
  const goal = { yAxis: GOAL, lineStyle: { type: 'dashed' }, label: { position: 'insideStartBottom', formatter: `Goal ${formatValue(GOAL)}` } }

  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', valueFormatter: value => formatValue(+value) },
        xAxis: { type: 'category', data: days.map(d => formatDay(d.date)) },
        yAxis: { type: 'value', min: 0, max: VALUE_MAX, axisLabel: { formatter: formatValue } },
        // Marks belong to a series. ECharts merges every new option into the last one: the marks are switched off with
        // empty data, leaving them out would keep the old ones
        series: [{
          type: 'line',
          name: 'Active users',
          data: days.map(d => d.users),
          showSymbol: false,
          markLine: {
            symbol: 'none',
            silent: true,
            lineStyle: { color: 'gray', type: preset === 'rings' ? [2, 2] : 'solid' },
            label: { position: 'end', width: 100, overflow: 'break', lineHeight: 14 },
            data: [...callouts, ...(preset === 'window' ? [goal] : [])],
          },
          markPoint: {
            symbol: 'circle',
            symbolSize: 12,
            silent: true,
            itemStyle: { color: 'transparent', borderColor: 'gray', borderWidth: 1 },
            label: { show: false },
            data: preset === 'rings' ? events.map(e => ({ coord: [formatDay(e.date), e.users] })) : [],
          },
          markArea: {
            silent: true,
            itemStyle: { color: 'rgba(128, 128, 128, 0.2)' },
            data: preset === 'window' ? [[{ xAxis: formatDay(incident.start) }, { xAxis: formatDay(incident.end) }]] : [],
          },
        }],
      }}
    />
  )
}
