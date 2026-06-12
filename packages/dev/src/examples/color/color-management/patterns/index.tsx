import React from 'react'
import { VisXYContainer, VisStackedBar, VisArea, VisScatter, VisLine, VisAxis } from '@unovis/react'
import { FillPatternType, LinePatternType, GenericAccessor, NumericAccessor } from '@unovis/ts'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Patterns'
export const subTitle = 'Fill & line patterns across chart types'

// Built-in fill patterns, applied per data series via the `pattern` accessor's series index.
const fillPatterns = [
  FillPatternType.StripesDiagonal,
  FillPatternType.Dots,
  FillPatternType.Crosshatch,
  FillPatternType.Waves,
  FillPatternType.Circles,
  FillPatternType.StripesVertical,
]

// Built-in line patterns (marker + dash array), used by the Line chart.
const linePatterns = [
  LinePatternType.Triangle,
  LinePatternType.Diamond,
  LinePatternType.Square,
]

const seriesAccessors: NumericAccessor<XYDataRecord>[] = [
  (d: XYDataRecord) => d.y,
  (d: XYDataRecord) => d.y1,
  (d: XYDataRecord) => d.y2,
]

// For multi-series components the `pattern` accessor receives the series index as its second argument.
const seriesPattern: GenericAccessor<FillPatternType, XYDataRecord[]> = (_d, i) => fillPatterns[i]
const seriesLinePattern: GenericAccessor<LinePatternType, XYDataRecord[]> = (_d, i) => linePatterns[i]

const chartStyle: React.CSSProperties = {
  border: '1px solid var(--vis-color-grey, #ccc)',
  borderRadius: 8,
  padding: 12,
}

const labelStyle: React.CSSProperties = {
  margin: '0 0 8px',
  font: '600 13px/1.2 Inter, sans-serif',
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = generateXYDataRecords(15)
  const x = (d: XYDataRecord): number => d.x

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24,
        margin: 24,
      }}
    >
      <div style={chartStyle}>
        <p style={labelStyle}>Stacked Bar — fill pattern per series</p>
        <VisXYContainer<XYDataRecord> data={data} height={260}>
          <VisStackedBar x={x} y={seriesAccessors} pattern={seriesPattern} duration={props.duration}/>
          <VisAxis type='x' numTicks={5} duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </div>

      <div style={chartStyle}>
        <p style={labelStyle}>Area — fill pattern per series</p>
        <VisXYContainer<XYDataRecord> data={data} height={260}>
          <VisArea x={x} y={seriesAccessors} pattern={seriesPattern} opacity={0.9} duration={props.duration}/>
          <VisAxis type='x' numTicks={5} duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </div>

      <div style={chartStyle}>
        <p style={labelStyle}>Scatter — fill pattern per point</p>
        <VisXYContainer<XYDataRecord> data={data} height={260}>
          <VisScatter
            x={x}
            y={d => d.y}
            size={26}
            color={d => `var(--vis-color${Math.round(d.y) % fillPatterns.length})`}
            pattern={d => fillPatterns[Math.round(d.y) % fillPatterns.length]}
            duration={props.duration}
          />
          <VisAxis type='x' numTicks={5} duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </div>

      <div style={chartStyle}>
        <p style={labelStyle}>Line — line pattern (marker + dash) per series</p>
        <VisXYContainer<XYDataRecord> data={data} height={260}>
          <VisLine x={x} y={seriesAccessors} pattern={seriesLinePattern} lineWidth={2} duration={props.duration}/>
          <VisAxis type='x' numTicks={5} duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </div>
    </div>
  )
}
