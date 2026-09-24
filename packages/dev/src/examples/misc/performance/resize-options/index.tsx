import React, { useCallback, useMemo, useRef, useState } from 'react'
import { VisXYContainer, VisAxis, VisLine } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Resize Behaviour'
export const subTitle = 'Drag the handle to compare the options'

type Datum = { x: number; y: number }

const DEBOUNCE_OPTIONS = [0, 100, 400]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [resizeDebounce, setResizeDebounce] = useState(100)
  const [redrawOnResize, setRedrawOnResize] = useState(true)

  // Counting through a ref and writing the text by hand: putting the count in state would re-render
  // the container, which would trigger another `onRenderComplete` and never settle
  const countRef = useRef(0)
  const labelRef = useRef<HTMLElement>(null)
  const showCount = useCallback((n: number) => {
    countRef.current = n
    if (labelRef.current) labelRef.current.textContent = String(n)
  }, [])

  const data = useMemo<Datum[]>(() => Array(2000).fill(0).map((_, i) => ({
    x: i,
    y: 50 + 30 * Math.sin(i / 90) + 8 * Math.sin(i / 11),
  })), [])

  // `resize` makes the wrapper draggable, so the container's size changes continuously
  const wrapperStyle = { resize: 'horizontal', overflow: 'hidden', width: 640, minWidth: 240, border: '1px dashed var(--vis-color0)' } as const

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label>
          <code>resizeDebounce</code>:{' '}
          <select value={resizeDebounce} onChange={e => { setResizeDebounce(+e.target.value); showCount(0) }}>
            {DEBOUNCE_OPTIONS.map(ms => <option key={ms} value={ms}>{ms} ms</option>)}
          </select>
        </label>
        <label>
          <input type='checkbox' checked={redrawOnResize} onChange={e => { setRedrawOnResize(e.target.checked); showCount(0) }}/>
          {' '}<code>redrawOnResize</code>
        </label>
        <span>redraws: <strong ref={labelRef}>0</strong></span>
        <button onClick={() => showCount(0)}>Reset</button>
      </div>
      <p>
        Drag the bottom-right corner of the dashed box. With the default <code>100 ms</code> the chart
        redraws once you stop; with <code>0</code> it redraws on every frame of the drag. Unticking{' '}
        <code>redrawOnResize</code> keeps the SVG box following the container while its contents stay put.
      </p>
      <div style={wrapperStyle}>
        <VisXYContainer<Datum>
          data={data}
          height={260}
          resizeDebounce={resizeDebounce}
          redrawOnResize={redrawOnResize}
          onRenderComplete={(): void => showCount(countRef.current + 1)}
        >
          <VisLine x={(d: Datum) => d.x} y={(d: Datum) => d.y} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </div>
    </div>
  )
}
