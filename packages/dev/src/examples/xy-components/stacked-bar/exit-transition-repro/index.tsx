import React, { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { VisXYContainer, VisStackedBar, VisAxis } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Enter & Exit Transitions'
export const subTitle = 'Rapid data updates, negative stacks'

type Rec = { x: number; y: number; y1: number }

const datasets: Rec[][] = [
  [1, 2, 3, 4, 5].map(x => ({ x, y: 5 + x, y1: 3 })),
  [2, 4, 6].map(x => ({ x, y: 10 - x, y1: 2 })),
  [1, 3, 5, 7].map(x => ({ x, y: 4, y1: x })),
  [4].map(x => ({ x, y: 8, y1: 1 })),
  [],
  [1, 3, 4, 6].map(x => ({ x, y: 4 + x, y1: -3 - (x % 3) })),
  [1, 2, 6, 7].map(x => ({ x, y: 6, y1: 2 })),
]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [index, setIndex] = useState(0)
  const [running, setRunning] = useState<number | false>(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (running) intervalRef.current = setInterval(() => setIndex(i => i + 1), running)
    else clearInterval(intervalRef.current)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const next = useCallback(() => setIndex(i => i + 1), [])
  const doubleUpdate = useCallback(() => {
    flushSync(() => setIndex(i => i + 1))
    flushSync(() => setIndex(i => i + 1))
  }, [])

  return (
    <div>
      <button onClick={next}>Next dataset</button>
      <button onClick={doubleUpdate}>Double update</button>
      <button onClick={() => setRunning(r => (r ? false : 350))}>{running ? 'Stop' : 'Auto-cycle'}</button>
      <button onClick={() => setRunning(r => (r ? false : 16))}>Auto-fast</button>
      <span style={{ marginLeft: 10 }}>dataset: {index % datasets.length}</span>
      <VisXYContainer<Rec> data={datasets[index % datasets.length]} height={300} xDomain={[0, 8]}>
        <VisStackedBar<Rec>
          x={d => d.x}
          y={[d => d.y, d => d.y1]}
          id={d => String(d.x)}
          dataStep={1}
          duration={props.duration ?? 1000}
        />
        <VisAxis type='x' duration={props.duration ?? 1000}/>
        <VisAxis type='y' duration={props.duration ?? 1000}/>
      </VisXYContainer>
    </div>
  )
}
