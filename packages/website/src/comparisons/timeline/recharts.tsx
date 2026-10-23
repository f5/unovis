import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

import type { ChartProps } from '../types'
import { DAY, WEEK_END, WEEK_START } from './constants'
import { EventKind, TimelineEvent, kinds, services, formatDay, formatRange, getKindLabel } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs
const colors = ['#8884d8', '#ff7300', '#82ca9d']
const days = Array.from({ length: 8 }, (_, i) => WEEK_START + i * DAY)

export default function RechartsTimeline ({ data, isDark, preset }: ChartProps<TimelineEvent[]>): JSX.Element {
  const [hidden, setHidden] = useState<Partial<Record<EventKind, boolean>>>({})
  const textColor = isDark ? '#aaa' : '#666'

  // As in Recharts' timeline example, every row is a lane and every bar a [start, end] range. A lane holds several items
  // of a kind, so each kind gets one bar per item: `deployment0`, `deployment1`, …
  const lanes = services.map(service => {
    const lane: Record<string, unknown> & { events: Record<string, TimelineEvent> } = { service, events: {} }
    kinds.forEach(k => data.filter(d => d.service === service && d.kind === k.key).forEach((d, i) => {
      lane[`${k.key}${i}`] = [d.start, d.end]
      lane.events[`${k.key}${i}`] = d
    }))
    return lane
  })
  const bars = kinds.flatMap((k, kindIndex) => {
    const count = Math.max(...services.map(service => data.filter(d => d.service === service && d.kind === k.key).length))
    return Array.from({ length: count }, (_, i) => ({ dataKey: `${k.key}${i}`, kind: k, color: colors[kindIndex], inLegend: i === 0 }))
  })

  return (
    <BarChart data={lanes} layout="vertical" responsive style={{ height: '100%' }} margin={{ top: 5, right: 20, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'}/>
      {/* The lanes without an item for a bar give it a value of 0, `allowDataOverflow` keeps the axis on the week */}
      <XAxis type="number" domain={[WEEK_START, WEEK_END]} allowDataOverflow ticks={days} tickFormatter={formatDay} stroke={textColor}/>
      <YAxis type="category" dataKey="service" width="auto" stroke={textColor}/>
      {/* With `shared={false}` the default tooltip has no heading, a custom content shows the hovered item in the default tooltip's style */}
      <Tooltip
        shared={false}
        cursor={{ fill: isDark ? '#333' : '#eee' }}
        content={({ active, payload }) => {
          if (!active || !payload?.length) return null
          const d = payload[0].payload.events[payload[0].dataKey as string]
          return (
            <div style={{ background: isDark ? '#222' : '#fff', border: `1px solid ${isDark ? '#444' : '#ccc'}`, padding: 10, whiteSpace: 'nowrap' }}>
              <div>{d.title}</div>
              <div style={{ color: payload[0].color }}>{d.service} · {getKindLabel(d.kind)}</div>
              <div style={{ color: payload[0].color }}>{formatRange(d)}</div>
            </div>
          )
        }}
      />
      <Legend onClick={({ value }) => {
        const kind = kinds.find(k => k.label === value).key
        setHidden({ ...hidden, [kind]: !hidden[kind] })
      }}/>
      {bars.map(b => (
        <Bar
          key={b.dataKey}
          dataKey={b.dataKey}
          name={b.kind.label}
          stackId="lane"
          fill={b.color}
          hide={hidden[b.kind.key]}
          legendType={b.inLegend ? 'rect' : 'none'}
          radius={preset === 'rounded' ? 999 : undefined}
        />
      ))}
    </BarChart>
  )
}
