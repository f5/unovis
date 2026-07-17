import React, { useMemo, useRef } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisTooltip, VisCrosshair, VisStackedBar, VisGroupedBar, VisScatter } from '@unovis/react'

import { TimeSeriesDataRecord, generateTimeSeriesDataRecords } from '@src/utils/data'
import { formatDateTimeLabel } from '@src/utils/format'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { Scale } from '@unovis/ts'

export const title = 'Gradient Area Chart'
export const subTitle = 'Theming, Time Axis Formatting'

const numSeries = 5
const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#14b8a6', '#8b5cf6', '#fb923c', '#ec4899', '#10b981', '#6366f1', '#facc15', '#22c55e', '#06b6d4', '#a855f7', '#d946ef']

const svgDefs = colors.slice(0, numSeries).map((color, i) => `
  <linearGradient id="gradient-${i}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${color}" stop-opacity="0.4" />
    <stop offset="100%" stop-color="${color}" stop-opacity="0.02" />
  </linearGradient>
  <linearGradient id="gradient-2-${i}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${color}" stop-opacity="0.7" />
    <stop offset="100%" stop-color="${color}" stop-opacity="0.4" />
  </linearGradient>
  `).join('')

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const accessors = Array.from({ length: numSeries }, (_, i) => (d: TimeSeriesDataRecord) => d.values[i])
  const gradientColors = colors.slice(0, numSeries).map((_, i) => `url(#gradient-${i})`)
  const gradientColorsStackedBar = colors.slice(0, numSeries).map((_, i) => `url(#gradient-2-${i})`)

  const lineColors = colors.slice(0, numSeries)

  const data = generateTimeSeriesDataRecords(numSeries, 35)
  const barData = generateTimeSeriesDataRecords(numSeries, 12)

  const areaScale = useMemo(() => Scale.scaleTime(), [])
  const stackedBarScale = useMemo(() => Scale.scaleTime(), [])
  const groupedBarScale = useMemo(() => Scale.scaleTime(), [])
  const scatterScale = useMemo(() => Scale.scaleTime(), [])

  const containerStyle = {
    '--vis-tooltip-padding': '3px 6px',
    '--vis-crosshair-line-stroke-color': '#aac',
    '--vis-font-family': 'Bricolage Grotesque',
    fontFamily: 'Bricolage Grotesque',
    lineHeight: 1,
  }

  const xAxisProps = {
    numTicks: 5,
    tickFormat: (x: number | Date, i: number, ticks: number[] | Date[]) => formatDateTimeLabel(x, i, ticks),
    duration: props.duration,
    // gridLine: false,
  }

  const yAxisProps = {
    type: 'y' as const,
    gridLine: false,
    duration: props.duration,
    tickSize: 3,
    numTicks: 3,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <VisXYContainer<TimeSeriesDataRecord>
        data={data}
        margin={{ top: 5, left: 5 }}
        xScale={areaScale}
        svgDefs={svgDefs}
        style={containerStyle}
      >
        <VisArea
          x={d => d.time}
          y={accessors}
          duration={props.duration}
          color={gradientColors}
          line={true}
          lineWidth={1}
          lineColor={lineColors}
        />
        <VisAxis type='x' {...xAxisProps} />
        <VisAxis {...yAxisProps} label='Area' />
        <VisCrosshair
          color={lineColors}
          template={(d: TimeSeriesDataRecord) =>
            `<span style="color: grey; font-size: 12px;">${new Date(d.time).toLocaleTimeString()}</span>`}
        />
        <VisTooltip ref={tooltipRef}/>
      </VisXYContainer>

      <VisXYContainer<TimeSeriesDataRecord>
        data={barData}
        margin={{ top: 5, left: 5 }}
        xScale={stackedBarScale}
        svgDefs={svgDefs}
        style={containerStyle}
      >
        <VisStackedBar
          x={d => d.time}
          y={accessors}
          duration={props.duration}
          color={gradientColorsStackedBar}
        />
        <VisAxis type='x' {...xAxisProps} />
        <VisAxis {...yAxisProps} label='Stacked Bar' />
      </VisXYContainer>

      <VisXYContainer<TimeSeriesDataRecord>
        data={barData}
        margin={{ top: 5, left: 5 }}
        xScale={groupedBarScale}
        svgDefs={svgDefs}
        style={containerStyle}
      >
        <VisGroupedBar
          x={d => d.time}
          y={accessors}
          duration={props.duration}
          color={gradientColorsStackedBar}
        />
        <VisAxis type='x' {...xAxisProps} />
        <VisAxis {...yAxisProps} label='Grouped Bar' />
      </VisXYContainer>

      <VisXYContainer<TimeSeriesDataRecord>
        data={data}
        margin={{ top: 5, left: 5 }}
        xScale={scatterScale}
        svgDefs={svgDefs}
        style={containerStyle}
      >
        <VisScatter
          x={d => d.time}
          y={accessors}
          duration={props.duration}
          color={gradientColorsStackedBar}
          size={10}
        />
        <VisAxis type='x' {...xAxisProps} />
        <VisAxis {...yAxisProps} label='Scatter' />
      </VisXYContainer>
    </div>
  )
}
