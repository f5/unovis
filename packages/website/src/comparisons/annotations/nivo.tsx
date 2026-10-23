import React from 'react'
import { ResponsiveLine } from '@nivo/line'

import type { ChartProps } from '../types'
import { VALUE_MAX } from './constants'
import { Data, formatDay, formatEvent, formatValue } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  grid: { line: { stroke: '#444' } },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoAnnotationsChart ({ data, isDark }: ChartProps<Data>): JSX.Element {
  const { days, events } = data
  const textColor = isDark ? '#ccc' : '#333'

  return (
    <ResponsiveLine
      data={[{ id: 'Active users', data: days.map(d => ({ x: d.date, y: d.users })) }]}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 10, right: 10, bottom: 25, left: 45 }}
      xScale={{ type: 'time', useUTC: false }}
      yScale={{ type: 'linear', min: 0, max: VALUE_MAX }}
      yFormat={formatValue}
      axisBottom={{ format: formatDay, tickValues: 'every month' }}
      axisLeft={{ format: formatValue }}
      enablePoints={false}
      enableSlices="x"
      // Line charts have no annotations: `markers` are lines across the whole plot at a value, with one line of text.
      // Vertical text keeps the long labels from overlapping
      markers={events.map(e => ({
        axis: 'x',
        value: e.date,
        legend: formatEvent(e),
        legendOrientation: 'vertical',
        legendPosition: 'top-left',
        lineStyle: { stroke: textColor, strokeWidth: 1 },
        textStyle: { fill: textColor, fontSize: 11 },
      }))}
    />
  )
}
