import React, { useState } from 'react'
import { PieChart, Pie, Label, Tooltip, Legend } from 'recharts'

import type { ChartProps } from '../types'
import { DataRecord, formatValue, getTotal } from './data'
import { IconSymbols, ICON_SIZE, iconId } from './icon-symbols'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function RechartsDonutChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const textColor = isDark ? '#ccc' : '#333'
  const slices = data.map((d, i) => ({ ...d, sessions: hidden[d.source] ? 0 : d.sessions, fill: colors[i] }))
  const isHalf = preset === 'half'
  // Slice labels are text, so the icons come from a custom label renderer placed at the middle of each slice
  const iconLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, source, value }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; source: string; value: number }): JSX.Element | null => {
    if (!value) return null
    const radius = (innerRadius + outerRadius) / 2
    const angle = -midAngle * Math.PI / 180
    return <use href={`#${iconId(source)}`} x={cx + radius * Math.cos(angle) - ICON_SIZE / 2} y={cy + radius * Math.sin(angle) - ICON_SIZE / 2} width={ICON_SIZE} height={ICON_SIZE} color="white"/>
  }

  return (
    <PieChart responsive style={{ height: '100%' }}>
      {preset === 'icons' && <defs><IconSymbols/></defs>}
      <Pie
        data={slices}
        dataKey="sessions"
        nameKey="source"
        // Angles are in degrees, counterclockwise from 3 o'clock. The half ring needs its own center and radii to fill the card
        startAngle={isHalf ? 180 : 0}
        endAngle={isHalf ? 0 : 360}
        cy={isHalf ? '75%' : '50%'}
        innerRadius={isHalf ? '90%' : '60%'}
        outerRadius={isHalf ? '120%' : '80%'}
        paddingAngle={preset === 'rounded' ? 2 : 0}
        cornerRadius={preset === 'rounded' ? 6 : 0}
        label={preset === 'icons' ? iconLabel : undefined}
        labelLine={false}
      >
        <Label position="center" value={`${formatValue(getTotal(data))} total sessions`} fill={textColor}/>
      </Pie>
      <Tooltip formatter={formatValue} contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}/>
      <Legend onClick={({ value }) => setHidden({ ...hidden, [`${value}`]: !hidden[`${value}`] })}/>
    </PieChart>
  )
}
