import React, { useState } from 'react'
import { RadialBarChart, RadialBar, PolarAngleAxis, PolarRadiusAxis, Label, Tooltip, Legend } from 'recharts'

import type { ChartProps } from '../types'
import { DataRecord, formatUsage, percentOfQuota, formatAverageUsage } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c']

export default function RechartsRadialBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const textColor = isDark ? '#ccc' : '#333'
  // One angle axis for every ring, so the values are percent of the quota. The legend lists the records by `name` and
  // `fill`; a hidden record gets a zero value and draws no bar
  const rings = data.map((d, i) => ({ ...d, name: d.label, fill: hidden[d.label] ? '#ccc' : colors[i], percent: hidden[d.label] ? 0 : percentOfQuota(d) }))
  const gauge = preset === 'gauge'
  const thick = preset === 'thick'
  const cornerRadius = preset === 'rounded' ? 8 : 0

  return (
    <RadialBarChart
      data={rings}
      responsive
      style={{ height: '100%' }}
      // Degrees, counterclockwise from 3 o'clock
      startAngle={gauge ? 225 : 90}
      endAngle={gauge ? -45 : -270}
      // The rings split the space between the two radii, which are shares of the chart's radius
      innerRadius={thick ? '25%' : '50%'}
      outerRadius="95%"
      barSize={thick ? 28 : 16}
    >
      <PolarAngleAxis type="number" domain={[0, 100]} tick={false}/>
      {/* The first record is the innermost ring, so the radius axis is reversed to put it outside, as in Unovis */}
      <PolarRadiusAxis type="category" dataKey="name" reversed tick={false} axisLine={false}>
        <Label position="center" value={`${formatAverageUsage(data)} used`} fill={textColor}/>
      </PolarRadiusAxis>
      <RadialBar dataKey="percent" background={{ fill: isDark ? '#444' : '#eee' }} cornerRadius={cornerRadius}/>
      {/* The tooltip payload carries the ring's percent as `value`, so the record is looked up for the real value */}
      <Tooltip
        formatter={(_, __, item) => [formatUsage(data.find(d => d.key === item.payload.key)), 'Used']}
        contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}
      />
      {/* The legend sorts its items by value; `itemSorter` keeps the data order */}
      <Legend
        itemSorter={item => rings.findIndex(r => r.name === item.value)}
        onClick={({ value }) => setHidden({ ...hidden, [`${value}`]: !hidden[`${value}`] })}
      />
    </RadialBarChart>
  )
}
