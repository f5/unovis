import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea, ReferenceLine } from 'recharts'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300']
const MIGRATION = { from: new Date(2024, 6, 1), to: new Date(2024, 8, 1) }
const BUDGET = 100

export default function RechartsAreaChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const textColor = isDark ? '#aaa' : '#666'

  return (
    <AreaChart data={data} responsive style={{ height: '100%' }} margin={{ top: 5, right: 10, left: -5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'}/>
      <XAxis dataKey={(d: DataRecord) => formatMonth(d.date)} stroke={textColor}/>
      <YAxis tickFormatter={formatValue} stroke={textColor}/>
      <Tooltip formatter={formatValue} contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}/>
      <Legend onClick={({ dataKey }) => setHidden({ ...hidden, [`${dataKey}`]: !hidden[`${dataKey}`] })}/>
      {series.map((s, i) => (
        <Area key={s.key} dataKey={s.key} name={s.label} stackId="spend" stroke={colors[i]} fill={colors[i]} hide={hidden[s.key]} type={preset === 'step' ? 'step' : 'linear'}/>
      ))}
      {preset === 'annotations' && (
        // The x axis is categorical, so the band's ends are the month labels
        <ReferenceArea x1={formatMonth(MIGRATION.from)} x2={formatMonth(MIGRATION.to)} label={{ value: 'Migration', position: 'insideTop', fill: textColor }}/>
      )}
      {preset === 'annotations' && (
        <ReferenceLine y={BUDGET} stroke="red" strokeDasharray="6 4" label={{ value: `Budget ${formatValue(BUDGET)}`, position: 'insideBottomRight', fill: textColor }}/>
      )}
    </AreaChart>
  )
}
