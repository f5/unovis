import React, { useMemo, useState } from 'react'
import { LinePatternType } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisLine } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Line Marker Spacing'
export const subTitle = 'Marker count follows the chart width, not the data'

type Datum = { x: number; [key: string]: number }

const NUM_POINTS = 9000
const NUM_LINES = 5
const SPACING_OPTIONS = [0, 20, 40, 80]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [markerSpacing, setMarkerSpacing] = useState(40)
  const [width, setWidth] = useState(1000)

  const data = useMemo<Datum[]>(() => Array(NUM_POINTS).fill(0).map((_, i) => {
    const d: Datum = { x: i }
    for (let l = 0; l < NUM_LINES; l++) d[`y${l}`] = 50 + 30 * Math.sin((i + l * 140) / 500) + 4 * Math.sin(i / 31)

    // `line - gap - point - gap - line` on the first series: the lone point has no segment to sit on,
    // so its marker is the only thing that shows it and the thinning has to keep it
    if (i > 3000 && i < 4500) d.y0 = i === 3750 ? 90 : undefined as unknown as number
    return d
  }), [])

  const accessors = useMemo(
    () => Array(NUM_LINES).fill(0).map((_, l) => (d: Datum) => d[`y${l}`]),
    []
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label>
          <code>markerSpacing</code>:{' '}
          <select value={markerSpacing} onChange={e => setMarkerSpacing(+e.target.value)}>
            {SPACING_OPTIONS.map(px => (
              <option key={px} value={px}>{px === 0 ? 'off (marker per point)' : `${px} px`}</option>
            ))}
          </select>
        </label>
        <label>
          Chart width:{' '}
          <input type='range' min={320} max={1400} step={20} value={width} onChange={e => setWidth(+e.target.value)}/>
          {' '}{width}px
        </label>
      </div>
      <p>
        {NUM_LINES} lines &times; {NUM_POINTS.toLocaleString()} points. With the spacing off, the browser
        paints a marker on every point. Drag the width slider — with a spacing set, the marker count
        follows the chart, not the data.
      </p>
      <div style={{ width, border: '1px dashed var(--vis-color0)' }}>
        <VisXYContainer<Datum> data={data} height={300}>
          <VisLine
            x={(d: Datum) => d.x}
            y={accessors}
            duration={props.duration}
            pattern={(): LinePatternType => LinePatternType.Circle}
            markerSpacing={markerSpacing || undefined}
          />
          <VisAxis type='x' duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </div>
    </div>
  )
}
