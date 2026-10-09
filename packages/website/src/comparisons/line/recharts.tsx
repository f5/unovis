import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

import { DataRecord, series, formatMonth, formatValue } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#8884d8', '#82ca9d', '#ffc658']

export default function RechartsLineChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const textColor = isDark ? '#aaa' : '#666'

  return (
    <LineChart data={data} responsive style={{ height: '100%' }} margin={{ top: 5, right: 10, left: -10 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'}/>
      <XAxis dataKey={(d: DataRecord) => formatMonth(d.date)} stroke={textColor}/>
      <YAxis tickFormatter={formatValue} stroke={textColor}/>
      <Tooltip formatter={formatValue} contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}/>
      <Legend onClick={({ dataKey }) => setHidden({ ...hidden, [`${dataKey}`]: !hidden[`${dataKey}`] })}/>
      {/* Missing months leave gaps. `connectNulls` would bridge them, but only with the same solid line */}
      {series.map((s, i) => (
        <Line key={s.key} dataKey={s.key} name={s.label} stroke={colors[i]} dot={false} hide={hidden[s.key]}/>
      ))}
    </LineChart>
  )
}
