import React from 'react'
import { ResponsiveBoxPlot, BoxPlotTooltipProps } from '@nivo/boxplot'

import type { ChartProps } from '../types'
import { DataRecord, formatMs } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  grid: { line: { stroke: '#444' } },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoBoxPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // Nivo computes the statistics from one row per sample
  const rows = data.flatMap(d => d.samples.map(value => ({ group: d.endpoint, value })))
  const minMax = preset === 'min-max'
  // The default tooltip lists the count, mean, extremes and every quantile in two columns; this one lists the five
  // quantiles the box draws, from the top
  const tooltip = ({ label, formatted }: BoxPlotTooltipProps): JSX.Element => {
    const [low, q1, median, q3, high] = formatted.values
    return (
      <div style={{ padding: '4px 8px', whiteSpace: 'nowrap', background: isDark ? '#222' : '#fff', color: isDark ? '#ccc' : '#333', borderRadius: 4 }}>
        <b>{label}</b>
        <div>{minMax ? 'Max' : 'Upper whisker'}: {high}</div>
        <div>Q3: {q3}</div>
        <div>Median: {median}</div>
        <div>Q1: {q1}</div>
        <div>{minMax ? 'Min' : 'Lower whisker'}: {low}</div>
      </div>
    )
  }

  return (
    <ResponsiveBoxPlot
      data={rows}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 10, right: 10, bottom: 25, left: 55 }}
      // The whiskers end at fixed quantiles, the 10th and 90th percentiles by default. Nivo has no Tukey whiskers
      // and doesn't draw outliers
      quantiles={minMax ? [0, 0.25, 0.5, 0.75, 1] : undefined}
      // Every box gets the same color unless the boxes are colored by group
      colorBy={preset === 'colors' ? 'group' : 'subGroup'}
      borderRadius={preset === 'rounded' ? 8 : 0}
      valueFormat={formatMs}
      tooltip={tooltip}
      axisLeft={{ format: formatMs }}
    />
  )
}
