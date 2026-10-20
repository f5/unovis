import React, { useCallback, useRef, useState } from 'react'
import { VisXYContainer, VisGroupedBar, VisAxis } from '@unovis/react'
import { Orientation } from '@unovis/ts'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Series Exit Transitions'
export const subTitle = 'Removing and re-adding series'

type Rec = { x: number; values: number[] }

const seriesCount = 6
const data: Rec[] = [0, 1, 2, 3, 4].map(x => ({
  x,
  values: Array.from({ length: seriesCount }, (_, i) => (i === 3 ? -1 : 1) * (4 + i * 2 + ((x * (i + 2)) % 5))),
}))
const accessors = Array.from({ length: seriesCount }, (_, i) => (d: Rec) => d.values[i])

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [count, setCount] = useState(seriesCount)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const duration = props.duration ?? 1000
  const y = accessors.slice(0, count)

  const removeAndReAdd = useCallback(() => {
    setCount(2)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCount(seriesCount), duration / 3)
  }, [duration])

  return (
    <div>
      <button onClick={() => setCount(seriesCount)}>{seriesCount} series</button>
      <button onClick={() => setCount(2)}>2 series</button>
      <button onClick={removeAndReAdd}>Remove 4, re-add mid exit</button>
      <span style={{ marginLeft: 10 }}>series: {count}</span>
      {[Orientation.Vertical, Orientation.Horizontal].map(orientation => (
        <VisXYContainer<Rec> key={orientation} data={data} height={260} style={{ marginTop: 16 }}>
          <VisGroupedBar<Rec> x={d => d.x} y={y} orientation={orientation} duration={duration}/>
          <VisAxis type='x' duration={duration}/>
          <VisAxis type='y' duration={duration}/>
        </VisXYContainer>
      ))}
    </div>
  )
}
