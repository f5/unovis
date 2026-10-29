import React, { useMemo } from 'react'
import { AnnotationItem, AxisType, PlotlineLabelPosition, PlotlineLineStylePresets, Scale, TextAlign, VerticalAlign } from '@unovis/ts'
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip, VisAnnotations, VisPlotband, VisPlotline } from '@unovis/react'

import type { ChartProps } from '../types'
import { CALLOUT_VALUE, GOAL, VALUE_MAX } from './constants'
import { Data, DataRecord, formatDay, formatEvent, formatValue } from './data'

const x = (d: DataRecord): number => d.date.getTime()
const y = (d: DataRecord): number => d.users
// The callouts are a fifth of the chart wide, and their text sits above `CALLOUT_VALUE`
const CALLOUT_WIDTH = 20
const CALLOUT_HEIGHT = `${(1 - CALLOUT_VALUE / VALUE_MAX) * 100}%` as const

export default function UnovisAnnotationsChart ({ data, preset }: ChartProps<Data>): JSX.Element {
  const xScale = useMemo(() => Scale.scaleTime(), [])
  const yScale = useMemo(() => Scale.scaleLinear(), [])
  const { days, events, incident } = data
  const tooltipTemplate = (d: DataRecord): string => `<b>${formatDay(d.date)}</b><div>Active users: ${formatValue(d.users)}</div>`

  // Text frames are placed in percent of the chart, centered over the event's day; the subjects follow the data
  const start = x(days[0])
  const range = x(days[days.length - 1]) - start
  const annotations: AnnotationItem[] = events.map(e => {
    const center = (e.date.getTime() - start) / range * 100
    return {
      x: `${Math.min(Math.max(center - CALLOUT_WIDTH / 2, 0), 100 - CALLOUT_WIDTH)}%`,
      y: 0,
      width: `${CALLOUT_WIDTH}%`,
      height: CALLOUT_HEIGHT,
      textAlign: TextAlign.Center,
      verticalAlign: VerticalAlign.Bottom,
      content: preset === 'rich' ? [{ text: e.title, fontWeight: 700 }, { text: e.detail }] : formatEvent(e),
      subject: {
        x: () => xScale(e.date),
        y: () => yScale(e.users),
        ...(preset === 'rings' && { radius: 6, connectorLineStrokeDasharray: '2 2' }),
      },
    }
  })

  return (
    <VisXYContainer data={days} height={320} xScale={xScale} yScale={yScale} yDomain={[0, VALUE_MAX]}>
      <VisLine x={x} y={y}/>
      {preset === 'window' && <VisPlotband axis={AxisType.X} from={incident.start.getTime()} to={incident.end.getTime()}/>}
      {preset === 'window' && (
        <VisPlotline axis={AxisType.Y} value={GOAL} labelText={`Goal ${formatValue(GOAL)}`} labelPosition={PlotlineLabelPosition.BottomLeft} lineStyle={PlotlineLineStylePresets.Dash}/>
      )}
      <VisAnnotations items={annotations}/>
      <VisAxis type="x" tickFormat={(t: Date) => formatDay(t)}/>
      <VisAxis type="y" tickFormat={formatValue}/>
      <VisCrosshair template={tooltipTemplate}/>
      <VisTooltip container={document.body}/>
    </VisXYContainer>
  )
}
