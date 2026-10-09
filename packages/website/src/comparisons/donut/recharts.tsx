import React, { useState } from 'react'
import { PieChart, Pie, Label, Tooltip, Legend } from 'recharts'

import { DataRecord, formatValue, getTotal } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function RechartsDonutChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const textColor = isDark ? '#ccc' : '#333'
  const slices = data.map((d, i) => ({ ...d, sessions: hidden[d.source] ? 0 : d.sessions, fill: colors[i] }))

  return (
    <PieChart responsive style={{ height: '100%' }}>
      <Pie data={slices} dataKey="sessions" nameKey="source" innerRadius="60%" outerRadius="80%">
        <Label position="center" value={`${formatValue(getTotal(data))} total sessions`} fill={textColor}/>
      </Pie>
      <Tooltip formatter={formatValue} contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}/>
      <Legend onClick={({ value }) => setHidden({ ...hidden, [`${value}`]: !hidden[`${value}`] })}/>
    </PieChart>
  )
}
