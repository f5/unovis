import React, { useEffect } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisBulletLegend } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { UnovisColorScale } from '@unovis/ts'

export const title = 'Custom Color Palette'
export const subTitle = 'Modifying the default palette'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  type Datum = { x: number; azure: number; aws: number; google: number; github: number; apple: number };
  const data: Datum[] = Array(175).fill(0).map((_, i) => {
    const t = i / 15
    return {
      x: i,
      azure: 80 + 15 * Math.sin(t) * t + i * 2,
      aws: 150 + 80 * Math.sin(t * 0.7) + i * 1.5,
      google: 200 + 60 * Math.cos(t * 1.2) + i * 3,
      github: 90 + 40 * Math.sin(t * 2) + i * 0.8,
      apple: 120 + 70 * Math.cos(t * 0.5 + 1) + i * 2.2,
    }
  })

  useEffect(() => {
    // Override the default palette globally
    UnovisColorScale.range(['#f0a8b4', '#7eb8d4', '#8ed49a', '#ffdc88', '#b89ef0', '#ffe8b8'])
  }, [])

  const areaChartKeys = ['azure', 'aws', 'github']
  const accessorsAreaChart = areaChartKeys.map(key => (d: Datum) => d[key as keyof Datum])

  return (
    <>
      <p>This example overrides the default color palette globally.</p>
      <p style={{ fontSize: '14px', color: 'gray' }}>⚠️ If you open other pages after this one, the charts there will also use the new palette.</p>
      <VisBulletLegend items={[{ name: 'Azure' }, { name: 'AWS' }, { name: 'GitHub' }]} />
      <VisXYContainer<Datum> data={data} margin={{ top: 5, left: 5 }}>
        <VisArea
          x={d => d.x}
          y={accessorsAreaChart}
          duration={props.duration}
        />
        <VisAxis
          type='x'
          numTicks={10}
          tickTextHideOverlapping={true}
          tickFormat={(tick: number | Date, i: number, ticks: number[] | Date[]) => `${tick}ms`}
          duration={props.duration}
        />
      </VisXYContainer>
    </>
  )
}
