import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea, ReferenceLine } from 'recharts'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#8884d8', '#82ca9d', '#ffc658']
const TARGET = 50

export default function RechartsLineChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const textColor = isDark ? '#aaa' : '#666'
  // The months the iOS app reported no data, for the "Annotations" preset
  const outage = data.filter(d => d.ios === undefined)

  return (
    <LineChart data={data} responsive style={{ height: '100%' }} margin={{ top: 5, right: 10, left: -10 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'}/>
      <XAxis dataKey={(d: DataRecord) => formatMonth(d.date)} stroke={textColor}/>
      <YAxis tickFormatter={formatValue} stroke={textColor}/>
      <Tooltip formatter={formatValue} contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}/>
      <Legend onClick={({ dataKey }) => setHidden({ ...hidden, [`${dataKey}`]: !hidden[`${dataKey}`] })}/>
      {preset === 'annotations' && outage.length > 0 && (
        <ReferenceArea
          x1={formatMonth(outage[0].date)}
          x2={formatMonth(outage[outage.length - 1].date)}
          fill={textColor}
          fillOpacity={0.15}
          label={{ value: 'iOS outage', position: 'insideTopLeft', fill: textColor }}
        />
      )}
      {preset === 'annotations' && (
        <ReferenceLine
          y={TARGET}
          stroke={textColor}
          strokeDasharray="6 4"
          label={{ value: `Target ${formatValue(TARGET)}`, position: 'insideTopRight', fill: textColor }}
        />
      )}
      {/* Missing months leave gaps. `connectNulls` would bridge them, but only with the same solid line */}
      {series.map((s, i) => (
        <Line
          key={s.key}
          dataKey={s.key}
          name={s.label}
          stroke={colors[i]}
          dot={false}
          hide={hidden[s.key]}
          type={preset === 'step' ? 'step' : 'linear'}
          strokeDasharray={preset === 'dashed' && s.key === 'ios' ? '6 4' : undefined}
        />
      ))}
    </LineChart>
  )
}
