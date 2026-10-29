import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts'

import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300']
const CAPACITY = 400

export default function RechartsStackedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const textColor = isDark ? '#aaa' : '#666'
  // Recharts names the layout after the axis the categories run along: `vertical` draws horizontal bars
  const isHorizontal = preset === 'horizontal'

  return (
    <BarChart data={data} layout={isHorizontal ? 'vertical' : 'horizontal'} responsive style={{ height: '100%' }} margin={{ top: 5, right: 10, left: -10 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'}/>
      {isHorizontal ? <XAxis type="number" tickFormatter={formatValue} stroke={textColor}/> : <XAxis dataKey="month" stroke={textColor}/>}
      {isHorizontal ? <YAxis type="category" dataKey="month" stroke={textColor}/> : <YAxis tickFormatter={formatValue} stroke={textColor}/>}
      <Tooltip
        formatter={formatValue}
        cursor={{ fill: isDark ? '#333' : '#eee' }}
        contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}
      />
      <Legend onClick={({ dataKey }) => setHidden({ ...hidden, [`${dataKey}`]: !hidden[`${dataKey}`] })}/>
      {series.map((s, i) => (
        <Bar key={s.key} dataKey={s.key} name={s.label} stackId="tickets" fill={colors[i]} hide={hidden[s.key]}/>
      ))}
      {preset === 'capacity' && (
        <ReferenceLine
          y={CAPACITY}
          stroke={textColor}
          strokeDasharray="6 4"
          label={{ value: `Capacity ${formatValue(CAPACITY)}`, position: 'insideTopRight', fill: textColor }}
        />
      )}
    </BarChart>
  )
}
