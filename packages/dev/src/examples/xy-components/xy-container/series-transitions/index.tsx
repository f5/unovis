import React, { useState } from 'react'
import { VisXYContainer, VisGroupedBar, VisStackedBar, VisLine, VisArea, VisScatter, VisAxis } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Series Transitions'
export const subTitle = 'Adding and removing series'

type Rec = { x: number } & Record<string, number>

const keys = ['v0', 'v1', 'v2', 'v3', 'v4', 'v5']
const colors: Record<string, string> = {
  v0: '#4e79a7',
  v1: '#f28e2b',
  v2: '#e15759',
  v3: '#76b7b2',
  v4: '#59a14f',
  v5: '#b07aa1',
}
const data: Rec[] = [0, 1, 2, 3, 4].map(x => ({ x, ...Object.fromEntries(keys.map((k, i) => [k, 4 + i * 3 + ((x * (i + 2)) % 5)])) }))

const presets: { label: string; keys: string[] }[] = [
  { label: 'All series', keys },
  { label: 'Keep v1 and v4', keys: ['v1', 'v4'] },
  { label: 'Remove v2', keys: keys.filter(k => k !== 'v2') },
]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [activeKeys, setActiveKeys] = useState(keys)
  const duration = props.duration ?? 1000
  const y = activeKeys.map(k => (d: Rec) => d[k])
  const color = (_: unknown, i: number, key?: string): string => colors[key ?? activeKeys[i]]
  const toggle = (key: string): void => setActiveKeys(ks => (ks.includes(key) ? ks.filter(k => k !== key) : keys.filter(k => k === key || ks.includes(k))))

  const charts: [string, React.ReactNode][] = [
    ['Grouped Bar', <VisGroupedBar<Rec> x={d => d.x} y={y} color={color} colorKeys={activeKeys} duration={duration}/>],
    ['Stacked Bar', <VisStackedBar<Rec> x={d => d.x} y={y} color={color} colorKeys={activeKeys} duration={duration}/>],
    ['Line', <VisLine<Rec> x={d => d.x} y={y} color={color} colorKeys={activeKeys} lineWidth={3} duration={duration}/>],
    ['Area', <VisArea<Rec> x={d => d.x} y={y} color={color} colorKeys={activeKeys} opacity={0.8} line={true} duration={duration}/>],
    ['Scatter', <VisScatter<Rec> x={d => d.x} y={y} color={color} colorKeys={activeKeys} size={14} duration={duration}/>],
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {presets.map(p => <button key={p.label} onClick={() => setActiveKeys(p.keys)}>{p.label}</button>)}
        {keys.map(k => (
          <label key={k} style={{ color: colors[k] }}>
            <input type='checkbox' checked={activeKeys.includes(k)} onChange={() => toggle(k)}/>{k}
          </label>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24, marginTop: 16 }}>
        {charts.map(([name, chart]) => (
          <div key={name}>
            <h4>{name}</h4>
            <VisXYContainer<Rec> data={data} height={200}>
              {chart}
              <VisAxis type='x' duration={duration}/>
              <VisAxis type='y' duration={duration}/>
            </VisXYContainer>
          </div>
        ))}
      </div>
    </div>
  )
}
