import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#8884d8', '#82ca9d', '#ffc658']

export default function RechartsGroupedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const textColor = isDark ? '#aaa' : '#666'
  // `layout="vertical"` stacks the categories vertically, so the bars run horizontally
  const horizontal = preset === 'horizontal'

  return (
    <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} responsive style={{ height: '100%' }} margin={{ top: 5, right: 10, left: horizontal ? 5 : -5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'}/>
      {horizontal ? <XAxis type="number" tickFormatter={formatValue} stroke={textColor}/> : <XAxis dataKey="region" stroke={textColor}/>}
      {horizontal ? <YAxis type="category" dataKey="region" width="auto" stroke={textColor}/> : <YAxis tickFormatter={formatValue} stroke={textColor}/>}
      <Tooltip
        formatter={formatValue}
        cursor={{ fill: isDark ? '#333' : '#eee' }}
        contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}
      />
      <Legend onClick={({ dataKey }) => setHidden({ ...hidden, [`${dataKey}`]: !hidden[`${dataKey}`] })}/>
      {series.map((s, i) => (
        <Bar key={s.key} dataKey={s.key} name={s.label} fill={colors[i]} hide={hidden[s.key]}/>
      ))}
    </BarChart>
  )
}
