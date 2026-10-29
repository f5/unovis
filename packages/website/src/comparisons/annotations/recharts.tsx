import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Label, ReferenceArea, ReferenceDot, ReferenceLine } from 'recharts'

import type { ChartProps } from '../types'
import { CALLOUT_VALUE, GOAL, VALUE_MAX } from './constants'
import { Data, DataRecord, formatDay, formatEvent, formatValue } from './data'

// Recharts doesn't have a default color palette, this color is from its docs
const color = '#8884d8'

export default function RechartsAnnotationsChart ({ data, isDark, preset }: ChartProps<Data>): JSX.Element {
  const { days, events, incident } = data
  const textColor = isDark ? '#aaa' : '#666'

  return (
    <LineChart data={days} responsive style={{ height: '100%' }} margin={{ top: 5, right: 10, left: -10 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'}/>
      <XAxis dataKey={(d: DataRecord) => formatDay(d.date)} stroke={textColor}/>
      <YAxis domain={[0, VALUE_MAX]} tickFormatter={formatValue} stroke={textColor}/>
      <Tooltip formatter={(value: number) => formatValue(value)} contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}/>
      {preset === 'window' && <ReferenceArea x1={formatDay(incident.start)} x2={formatDay(incident.end)} fill={textColor} fillOpacity={0.15}/>}
      {preset === 'window' && (
        <ReferenceLine y={GOAL} stroke={textColor} strokeDasharray="6 4" label={{ value: `Goal ${formatValue(GOAL)}`, position: 'insideBottomLeft', fill: textColor }}/>
      )}
      <Line dataKey="users" name="Active users" stroke={color} dot={false}/>
      {/* Every callout is a line segment between two data points, from the day's value up to the callout row, with its
          label above the end. A label's `width` makes the text wrap */}
      {events.map(e => (
        <ReferenceLine
          key={e.id}
          segment={[{ x: formatDay(e.date), y: e.users }, { x: formatDay(e.date), y: CALLOUT_VALUE }]}
          stroke={textColor}
          strokeDasharray={preset === 'rings' ? '2 2' : undefined}
        >
          {preset === 'rich' ? [
            // Labels don't stack, so the detail stays on one line and the headline is offset by a line above it
            <Label key="title" value={e.title} position="top" offset={24} fill={textColor} fontWeight="bold"/>,
            <Label key="detail" value={e.detail} position="top" fill={textColor}/>,
          ] : (
            <Label value={formatEvent(e)} position="top" width={100} fill={textColor}/>
          )}
        </ReferenceLine>
      ))}
      {preset === 'rings' && events.map(e => (
        <ReferenceDot key={e.id} x={formatDay(e.date)} y={e.users} r={6} fill="none" stroke={textColor}/>
      ))}
    </LineChart>
  )
}
