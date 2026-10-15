import React from 'react'
import { VisXYContainer, VisArea, VisLine, VisAxis, VisCrosshair } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Stacked and Regular Circles'
export const subTitle = 'Per-circle styles and color keys, issue #945'

type Datum = { x: number; a: number; b: number; c: number }

const colors = ['#3b82f6', '#f59e0b', '#10b981']
const colorMap: Record<string, string> = { a: colors[0], b: colors[1], c: colors[2] }
const data: Datum[] = Array.from({ length: 11 }, (_, x) => ({
  x,
  a: 20 + 5 * Math.sin(x / 2),
  b: 15 + 4 * Math.cos(x / 3),
  c: 70 + 6 * Math.sin(x / 1.5),
}))

const x = (d: Datum): number => d.x
const yStacked = [(d: Datum): number => d.a, (d: Datum): number => d.b]
const y = [(d: Datum): number => d.c]

export const component = (props: ExampleViewerDurationProps): React.ReactElement => (
  <div>
    <p>
      A <i>Crosshair</i> with both <code>yStacked</code> and <code>y</code> renders the stacked circles first and then
      the regular ones. Every per-circle accessor should receive the circle&apos;s position in that list.
    </p>

    <h4>
      <code>strokeColor</code> and <code>strokeWidth</code> accessors: the line&apos;s circle should have a thick green ring
      (was thin and blue, the style of the first stacked circle)
    </h4>
    <VisXYContainer<Datum> data={data} height={250} yDomain={[0, 90]}>
      <VisArea x={x} y={yStacked} color={colors} duration={props.duration}/>
      <VisLine x={x} y={y} color={colors[2]} duration={props.duration}/>
      <VisAxis type='x' duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
      <VisCrosshair
        x={x}
        yStacked={yStacked}
        y={y}
        circleRadius={7}
        color='#fff'
        strokeColor={(d: Datum, i: number) => colors[i]}
        strokeWidth={(d: Datum, i: number) => [2, 2, 4][i]}
        forceShowAt={5}
      />
    </VisXYContainer>

    <h4>
      Container <code>colorKeys</code>: each circle should match its series color (the colors were shuffled when a
      chart mixed stacked and regular components)
    </h4>
    <VisXYContainer<Datum> data={data} height={250} yDomain={[0, 90]} colorFunction={(key: string | number) => colorMap[key]}>
      <VisLine x={x} y={y} colorKeys={['c']} duration={props.duration}/>
      <VisArea x={x} y={yStacked} colorKeys={['a', 'b']} duration={props.duration}/>
      <VisAxis type='x' duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
      <VisCrosshair circleRadius={7} forceShowAt={5}/>
    </VisXYContainer>
  </div>
)
