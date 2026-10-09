import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

import { DataRecord, series, formatValue } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300']

export default function RechartsStackedBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const textColor = isDark ? '#aaa' : '#666'

  return (
    <BarChart data={data} responsive style={{ height: '100%' }} margin={{ top: 5, right: 10, left: -10 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'}/>
      <XAxis dataKey="month" stroke={textColor}/>
      <YAxis tickFormatter={formatValue} stroke={textColor}/>
      <Tooltip
        formatter={formatValue}
        cursor={{ fill: isDark ? '#333' : '#eee' }}
        contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}
      />
      <Legend onClick={({ dataKey }) => setHidden({ ...hidden, [`${dataKey}`]: !hidden[`${dataKey}`] })}/>
      {series.map((s, i) => (
        <Bar key={s.key} dataKey={s.key} name={s.label} stackId="tickets" fill={colors[i]} hide={hidden[s.key]}/>
      ))}
    </BarChart>
  )
}
