import React, { useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

import { DataRecord, species } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#8884d8', '#82ca9d', '#ffc658']
const shapes = ['circle', 'triangle', 'square'] as const

export default function RechartsScatterPlot ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const textColor = isDark ? '#aaa' : '#666'

  return (
    <ScatterChart responsive style={{ height: '100%' }} margin={{ top: 5, right: 10, bottom: 15, left: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'}/>
      <XAxis
        type="number"
        dataKey="flipperLength"
        name="Flipper length (mm)"
        domain={['auto', 'auto']}
        stroke={textColor}
        label={{ value: 'Flipper length (mm)', position: 'insideBottom', offset: -10, fill: textColor }}
      />
      <YAxis
        type="number"
        dataKey="billLength"
        name="Bill length (mm)"
        domain={['auto', 'auto']}
        stroke={textColor}
        label={{ value: 'Bill length (mm)', angle: -90, position: 'insideLeft', fill: textColor }}
      />
      <ZAxis type="number" dataKey="bodyMass" name="Body mass (g)" range={[60, 400]}/>
      <Tooltip contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}/>
      <Legend verticalAlign="top" onClick={({ value }) => setHidden({ ...hidden, [`${value}`]: !hidden[`${value}`] })}/>
      {species.map((name, i) => (
        <Scatter key={name} name={name} data={data.filter(d => d.species === name)} fill={colors[i]} shape={shapes[i]} legendType={shapes[i]} hide={hidden[name]}/>
      ))}
    </ScatterChart>
  )
}
