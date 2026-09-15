import React from 'react'
import { VisXYContainer, VisAxis } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { AxisTickSetMode, AxisTimeTickUnit, Scale } from '@unovis/ts'

export const title = 'Uniform Time Ticks'
export const subTitle = 'Constant label step across month boundaries'


const niceTickFormat = Scale.scaleTime().tickFormat() as (tick: number | Date) => string

const pad = (n: number): string => String(n).padStart(2, '0')
const monthName = (d: Date): string => d.toLocaleString('en-US', { month: 'short' })
const formatByUnit: Record<AxisTimeTickUnit, (d: Date) => string> = {
  [AxisTimeTickUnit.Second]: d => `${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
  [AxisTimeTickUnit.Minute]: d => `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  [AxisTimeTickUnit.Hour]: d => `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  [AxisTimeTickUnit.Day]: d => `${monthName(d)} ${d.getDate()}`,
  [AxisTimeTickUnit.Week]: d => `${monthName(d)} ${d.getDate()}`,
  [AxisTimeTickUnit.Month]: d => `${monthName(d)} ${d.getFullYear()}`,
  [AxisTimeTickUnit.Year]: d => String(d.getFullYear()),
}

const uniformTickFormat = (tick: number | Date, _i: number, _ticks: number[] | Date[], timeUnit?: AxisTimeTickUnit): string => {
  const date = new Date(tick)
  return timeUnit ? formatByUnit[timeUnit](date) : niceTickFormat(date)
}

type AxisExample = {
  label: string;
  domain: [number, number];
}

const axes: AxisExample[] = [
  { label: '7 days across a month boundary', domain: [+new Date(2026, 6, 27), +new Date(2026, 7, 2)] },
  { label: '30 days', domain: [+new Date(2026, 6, 10), +new Date(2026, 7, 9)] },
  { label: '90 days', domain: [+new Date(2026, 5, 1), +new Date(2026, 7, 30)] },
  { label: '48 hours across a month boundary', domain: [+new Date(2026, 6, 31, 13), +new Date(2026, 7, 2, 13)] },
  { label: '90 minutes across midnight', domain: [+new Date(2026, 6, 31, 23, 5), +new Date(2026, 7, 1, 0, 35)] },
  { label: '18 months', domain: [+new Date(2025, 3, 15), +new Date(2026, 9, 15)] },
]

const labelStyle: React.CSSProperties = { font: '11px monospace', color: '#888', margin: '12px 0 2px' }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => (
  <>
    {axes.map(axis => (
      <div key={axis.label}>
        <div style={labelStyle}>{axis.label} — nice, then uniform</div>
        <VisXYContainer xDomain={axis.domain} height={40} xScale={Scale.scaleTime()}>
          <VisAxis
            type='x'
            tickTextAdaptiveSets={true}
            tickTextHideOverlapping={true}
            tickFormat={niceTickFormat}
            duration={props.duration}
          />
        </VisXYContainer>
        <VisXYContainer xDomain={axis.domain} height={40} xScale={Scale.scaleTime()}>
          <VisAxis
            type='x'
            tickTextAdaptiveSets={AxisTickSetMode.Uniform}
            tickTextHideOverlapping={true}
            tickFormat={uniformTickFormat}
            duration={props.duration}
          />
        </VisXYContainer>
      </div>
    ))}
  </>
)
