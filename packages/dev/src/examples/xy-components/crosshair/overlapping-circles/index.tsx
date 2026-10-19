import React from 'react'
import { VisXYContainer, VisArea, VisAxis, VisCrosshair } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Overlapping Circles'
export const subTitle = 'Paint order of the circles that sit on top of each other'

type Datum = { x: number; a: number; b: number; c: number }

const colors = ['#3b82f6', '#f59e0b', '#10b981']
const thickAndThin: Datum[] = Array.from({ length: 11 }, (_, x) => ({ x, a: 1600, b: 3, c: 0 }))
const tinyNearZero: Datum[] = Array.from({ length: 11 }, (_, x) => ({ x, a: 0.01, b: 0.03, c: 0.02 }))

const x = (d: Datum): number => d.x
const yStacked = [(d: Datum): number => d.a, (d: Datum): number => d.b, (d: Datum): number => d.c]
const color = (d: Datum, i: number): string => colors[i]

export const component = (props: ExampleViewerDurationProps): React.ReactElement => (
  <div>
    <p>
      When the circles of a stacked <i>Crosshair</i> land within two radii of each other, the circle of the largest
      segment is painted last, so a thin segment doesn&apos;t cover it.
    </p>

    <h4>A thin segment (3) stacked on a thick one (1,600): the circle should be blue, not orange</h4>
    <VisXYContainer<Datum> data={thickAndThin} height={250} yDomain={[0, 2000]}>
      <VisArea x={x} y={yStacked.slice(0, 2)} color={color} duration={props.duration}/>
      <VisAxis type='x' duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
      <VisCrosshair x={x} yStacked={yStacked.slice(0, 2)} circleRadius={8} color={color} forceShowAt={5}/>
    </VisXYContainer>

    <h4>Three tiny segments near zero: the circle of the largest one (orange) should be on top</h4>
    <VisXYContainer<Datum> data={tinyNearZero} height={250} yDomain={[0, 1]}>
      <VisArea x={x} y={yStacked} color={color} duration={props.duration}/>
      <VisAxis type='x' duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
      <VisCrosshair x={x} yStacked={yStacked} circleRadius={8} color={color} forceShowAt={5}/>
    </VisXYContainer>
  </div>
)
