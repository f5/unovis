import React, { useState } from 'react'
import { RadialBarChart, RadialBar, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts'

import type { ChartProps } from '../types'
import { DataRecord, formatValue, percentOfGoal } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function RechartsCircularBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  // The undocumented `layout="centric"` grows the bars outward on one radius scale, so the values are percent of the
  // goal. The legend lists the records by `name` and `fill`; a hidden record gets a `null` value and draws no bar
  const bars = data.map((d, i) => ({ ...d, name: d.label, fill: hidden[d.label] ? '#ccc' : colors[i], percent: hidden[d.label] ? null : percentOfGoal(d) }))
  // The bars are drawn half a slot clockwise of their category angle, so start half a slot before the top (or a whole
  // slot before the left end of a half circle, which `cy` and `outerRadius` move down and enlarge to fill the chart)
  const half = preset === 'half'
  const range = half ? 180 : 360
  const slot = range / data.length
  const startAngle = half ? 180 - slot : 90 - slot / 2

  return (
    <RadialBarChart
      data={bars}
      layout="centric"
      responsive
      style={{ height: '100%' }}
      cy={half ? '75%' : '50%'}
      innerRadius="28%"
      outerRadius={half ? '100%' : '90%'}
      startAngle={startAngle}
      endAngle={startAngle - range}
      // The gap is a share of the category's angle, so it widens towards the outer edge
      barCategoryGap={preset === 'gaps' ? '20%' : '12%'}
    >
      <PolarAngleAxis type="category" dataKey="label" tick={false} axisLine={false}/>
      <PolarRadiusAxis type="number" domain={[0, 100]} tick={false} axisLine={false}/>
      {/* `background` is only drawn in the ring layout, so there's no track behind the bars */}
      <RadialBar dataKey="percent" cornerRadius={preset === 'square' ? 0 : 10}/>
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
