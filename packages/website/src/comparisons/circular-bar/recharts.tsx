import React, { useState } from 'react'
import { RadialBarChart, RadialBar, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts'

import { DataRecord, formatValue, percentOfGoal } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function RechartsCircularBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  // The undocumented `layout="centric"` grows the bars outward on one radius scale, so the values are percent of the
  // goal. The legend lists the records by `name` and `fill`; a hidden record gets a `null` value and draws no bar
  const bars = data.map((d, i) => ({ ...d, name: d.label, fill: hidden[d.label] ? '#ccc' : colors[i], percent: hidden[d.label] ? null : percentOfGoal(d) }))
  // The bars are drawn half a slot clockwise of their category angle, so start half a slot before the top
  const startAngle = 90 - 180 / data.length

  return (
    <RadialBarChart
      data={bars}
      layout="centric"
      responsive
      style={{ height: '100%' }}
      innerRadius="28%"
      outerRadius="90%"
      startAngle={startAngle}
      endAngle={startAngle - 360}
      barCategoryGap="12%"
    >
      <PolarAngleAxis type="category" dataKey="label" tick={false} axisLine={false}/>
      <PolarRadiusAxis type="number" domain={[0, 100]} tick={false} axisLine={false}/>
      {/* `background` is only drawn in the ring layout, so there's no track behind the bars */}
      <RadialBar dataKey="percent" cornerRadius={10}/>
      {/* The tooltip payload carries the bar's percent as `value`, so the record is looked up for the real value */}
      <Tooltip
        formatter={(_, __, item) => [formatValue(data.find(d => d.key === item.payload.key)), 'Today']}
        contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}
      />
      {/* The legend sorts its items by value; `itemSorter` keeps the data order */}
      <Legend
        itemSorter={item => bars.findIndex(b => b.name === item.value)}
        onClick={({ value }) => setHidden({ ...hidden, [`${value}`]: !hidden[`${value}`] })}
      />
    </RadialBarChart>
  )
}
