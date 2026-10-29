import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { DataRecord, formatMs } from './data'

export default function EChartsBoxPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const minMax = preset === 'min-max'
  // The boxplot transform yields the rows [name, low, Q1, median, Q3, high] and a second result with the outliers
  const tooltipFormatter = (params: { seriesType: string; name: string; value: (string | number)[] }): string => {
    if (params.seriesType === 'scatter') return `${params.value[0]}<br/>Outlier: <b>${formatMs(+params.value[1])}</b>`
    const [name, low, q1, median, q3, high] = params.value
    return [
      `<b>${name}</b>`,
      `${minMax ? 'Max' : 'Upper whisker'}: ${formatMs(+high)}`,
      `Q3: ${formatMs(+q3)}`,
      `Median: ${formatMs(+median)}`,
      `Q1: ${formatMs(+q1)}`,
      `${minMax ? 'Min' : 'Lower whisker'}: ${formatMs(+low)}`,
    ].join('<br/>')
  }

  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        dataset: [
          // One row of raw samples per box; the built-in boxplot transform computes the statistics.
          // `boundIQR: 'none'` puts the whiskers at the min and max. Otherwise they end at Q1 − 1.5 × IQR and
          // Q3 + 1.5 × IQR (or the extremes, if closer), not at the last samples inside those bounds
          { source: data.map(d => d.samples) },
          { transform: { type: 'boxplot', config: { itemNameFormatter: ({ value }: { value: number }) => data[value].endpoint, boundIQR: minMax ? 'none' : 1.5 } } },
          { fromDatasetIndex: 1, fromTransformResult: 1 },
        ],
        tooltip: { trigger: 'item', formatter: tooltipFormatter },
        xAxis: { type: 'category' },
        yAxis: { type: 'value', axisLabel: { formatter: formatMs } },
        series: [
          // `colorBy: 'data'` takes one palette color per box instead of one per series
          { type: 'boxplot', datasetIndex: 1, colorBy: preset === 'colors' ? 'data' : 'series' },
          // ECharts' boxplot doesn't draw outliers: its docs add them as a scatter series
          { type: 'scatter', datasetIndex: 2 },
        ],
      }}
    />
  )
}
