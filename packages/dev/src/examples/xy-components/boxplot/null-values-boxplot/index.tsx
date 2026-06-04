import React from 'react'
import { VisXYContainer, VisBoxplot, VisAxis } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Null & Missing Values'
export const subTitle = 'Rows where the accessors return null'

type NullableBoxplotRecord = {
  x: number;
  m: number | null;
  q: [number, number] | null;
  w: [number, number] | null;
}

// Real boxes interleaved with rows where the accessors return `null` ("no box at this x").
// The whisker extents straddle 0 so the y-domain includes 0 — this makes any phantom geometry
// drawn at yScale(0) (e.g. a median line for a null row) clearly visible on the 0 gridline.
const data: NullableBoxplotRecord[] = [
  { x: 0, m: 8, q: [5, 11], w: [2, 14] },
  { x: 1, m: null, q: null, w: null },
  { x: 2, m: -2, q: [-4, 1], w: [-6, 3] },
  { x: 3, m: null, q: null, w: null },
  { x: 4, m: 5, q: [2, 9], w: [-1, 12] },
  { x: 5, m: null, q: null, w: null },
]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => (
  <VisXYContainer<NullableBoxplotRecord> data={data} margin={{ top: 5, left: 5 }} height={400}>
    <VisBoxplot
      x={d => d.x}
      median={d => d.m}
      quartiles={d => d.q}
      whiskers={d => d.w}
      duration={props.duration}
    />
    <VisAxis type='x' numTicks={6} duration={props.duration}/>
    <VisAxis type='y' duration={props.duration}/>
  </VisXYContainer>
)
