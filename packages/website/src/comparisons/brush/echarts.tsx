import React, { useEffect, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsInstance } from 'echarts-for-react'

import type { ChartProps } from '../types'
import { LAST_30_DAYS, READOUT_STYLE } from './constants'
import { DataRecord, formatDate, formatSelection, formatValue } from './data'

// echarts-for-react sets the option again whenever it isn't deep-equal to the last one, so the formatters are defined once
const tooltipFormatter = ([{ value, marker }]: { value: [Date, number]; marker: string }[]): string => `${formatDate(value[0])}<br/>${marker}${formatValue(value[1])} requests`
const sliderLabelFormatter = (value: number): string => formatDate(new Date(value))

export default function EChartsBrushChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const chartRef = useRef<ReactECharts>(null)
  // The zoomed range is kept in state and passed in every option, which ECharts merges into the last one
  const [range, setRange] = useState<[number, number] | undefined>()
  const zoomBox = preset === 'zoom-box'

  useEffect(() => {
    setRange(preset === 'window' ? [+LAST_30_DAYS[0], +LAST_30_DAYS[1]] : undefined)
    // The toolbox's zoom button starts off; this switches it on, so dragging on the chart zooms right away
    if (zoomBox) chartRef.current?.getEchartsInstance().dispatchAction({ type: 'takeGlobalCursor', key: 'dataZoomSelect', dataZoomSelectActive: true })
  }, [preset])

  const onDataZoom = (_: unknown, chart: EChartsInstance): void => {
    const { startValue, endValue } = (chart.getOption().dataZoom as { startValue: number; endValue: number }[])[0]
    setRange([startValue, endValue])
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={READOUT_STYLE}>{formatSelection(data, range)}</div>
      <ReactECharts
        ref={chartRef}
        theme={isDark ? 'dark' : undefined}
        style={{ flex: 1, minHeight: 0 }}
        // Merging can't remove a component: with `replaceMerge`, a toolbox left out of the option is removed
        replaceMerge={['toolbox']}
        onEvents={{ datazoom: onDataZoom }}
        option={{
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis', formatter: tooltipFormatter },
          grid: { bottom: 90 },
          xAxis: { type: 'time' },
          yAxis: { type: 'value', axisLabel: { formatter: formatValue } },
          // The slider draws the series' shadow behind the selection
          dataZoom: [{
            type: 'slider',
            ...(range ? { startValue: range[0], endValue: range[1] } : { start: 0, end: 100 }),
            labelFormatter: sliderLabelFormatter,
            // A handle's width follows its icon's aspect ratio at the slider's height (30px): a 14 × 30 rectangle is 14px wide
            ...(preset === 'handles' && { handleIcon: 'path://M0,0H14V30H0Z' }),
          }],
          toolbox: zoomBox ? { id: 'zoom', feature: { dataZoom: {} } } : [],
          series: [{
            type: 'line',
            areaStyle: {},
            showSymbol: false,
            data: data.map(d => [d.date, d.requests]),
          }],
        }}
      />
    </div>
  )
}
