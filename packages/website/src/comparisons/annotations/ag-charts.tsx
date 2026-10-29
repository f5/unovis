import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-charts-community'

import type { ChartProps } from '../types'
import { CALLOUT_VALUE, GOAL, VALUE_MAX } from './constants'
import { ChartEvent, Data, formatDay, formatEvent, formatValue } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

export default function AgChartsAnnotationsChart ({ data, isDark, preset }: ChartProps<Data>): JSX.Element {
  const { days, events, incident } = data
  const textColor = isDark ? '#ccc' : '#333'
  const isEventDay = (date: Date): boolean => events.some(e => e.date.getTime() === date.getTime())

  // The Annotations module (text, callouts, notes) is Enterprise. In Community every callout is a two-point line
  // series from the day's value up to the callout row, its connector, and the text is the label of its top point.
  // Labels wrap at `maxWidth`; a `formatter` returning text segments styles parts of a label
  const callouts = events.map(e => ({
    type: 'line' as const,
    data: [{ date: e.date, users: e.users }, { date: e.date, users: CALLOUT_VALUE, event: e }],
    xKey: 'date',
    yKey: 'users',
    showInLegend: false,
    stroke: 'gray',
    strokeWidth: 1,
    lineDash: preset === 'rings' ? [2, 2] : undefined,
    marker: { enabled: false },
    tooltip: { enabled: false },
    // Without it the callouts fade out while the main line is hovered
    highlight: { unhighlightedSeries: { opacity: 1 } },
    label: {
      enabled: true,
      placement: 'top' as const,
      maxWidth: 100,
      wrapping: 'on-space' as const,
      formatter: ({ datum }: { datum: { event?: ChartEvent } }) => {
        if (!datum.event) return ''
        return preset === 'rich'
          ? [{ text: `${datum.event.title}\n`, fontWeight: 'bold' as const }, { text: datum.event.detail }]
          : formatEvent(datum.event)
      },
    },
  }))

  return (
    <AgCharts
      style={{ height: '100%' }}
      options={{
        data: days,
        theme: isDark ? 'ag-default-dark' : 'ag-default',
        background: { visible: false },
        legend: { enabled: false },
        series: [
          {
            type: 'line',
            xKey: 'date',
            yKey: 'users',
            yName: 'Active users',
            // Rings are the markers of the annotated days, the others are drawn with size 0
            marker: {
              enabled: preset === 'rings',
              size: 12,
              itemStyler: ({ datum }) => ({ size: isEventDay(datum.date) ? 12 : 0, fill: 'transparent', stroke: textColor, strokeWidth: 1 }),
            },
          },
          ...callouts,
        ],
        axes: {
          x: {
            type: 'time',
            nice: false,
            crossLines: preset === 'window'
              ? [{ type: 'range', range: [incident.start, incident.end], fill: 'gray', fillOpacity: 0.2, strokeWidth: 0 }]
              : undefined,
          },
          y: {
            type: 'number',
            min: 0,
            max: VALUE_MAX,
            crossLines: preset === 'window'
              ? [{ type: 'line', value: GOAL, lineDash: [6, 4], label: { text: `Goal ${formatValue(GOAL)}`, position: 'bottom-left' } }]
              : undefined,
          },
        },
        formatter: {
          x: ({ value }) => formatDay(value as Date),
          y: ({ value }) => formatValue(value as number),
        },
      }}
    />
  )
}
