import React, { useEffect, useState } from 'react'
import { AreaChart, Area, Brush, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

import type { ChartProps } from '../types'
import { LAST_30_DAYS, READOUT_STYLE } from './constants'
import { DataRecord, formatDate, formatDay, formatSelection, formatValue } from './data'

// Recharts doesn't have a default color palette, this color is from its docs
const color = '#8884d8'

export default function RechartsBrushChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  // The brush selects a range of data indices
  const fullYear = { startIndex: 0, endIndex: data.length - 1 }
  const [range, setRange] = useState(fullYear)

  useEffect(() => {
    setRange(preset === 'window' ? { startIndex: data.findIndex(d => +d.date === +LAST_30_DAYS[0]), endIndex: data.length - 1 } : fullYear)
  }, [preset])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={READOUT_STYLE}>{formatSelection(data, [data[range.startIndex].date, data[range.endIndex].date])}</div>
      <AreaChart data={data} responsive style={{ flex: 1, minHeight: 0 }} margin={{ top: 5, right: 10, left: -5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'}/>
        <XAxis dataKey="date" tickFormatter={formatDay} stroke={textColor}/>
        <YAxis tickFormatter={formatValue} stroke={textColor}/>
        <Tooltip
          labelFormatter={formatDate}
          formatter={(value: number) => [formatValue(value), 'Requests']}
          contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}
        />
        <Area dataKey="requests" stroke={color} fill={color}/>
        <Brush
          dataKey="date"
          height={60}
          startIndex={range.startIndex}
          endIndex={range.endIndex}
          onChange={({ startIndex, endIndex }) => setRange({ startIndex, endIndex })}
          tickFormatter={formatDate}
          travellerWidth={preset === 'handles' ? 14 : undefined}
          fill={isDark ? '#222' : undefined}
          stroke={textColor}
        >
          {/* A chart inside the brush draws the whole year behind the selection */}
          <AreaChart data={data}>
            <Area dataKey="requests" stroke={color} fill={color}/>
          </AreaChart>
        </Brush>
      </AreaChart>
    </div>
  )
}
