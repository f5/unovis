import React, { useMemo } from 'react'
import { quantile } from 'd3-array'
import { VisXYContainer, VisScatter, VisBoxplot, VisAxis } from '@unovis/react'

import { BoxplotDataRecord, randomNumberGenerator } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Boxplot with Scatter'
export const subTitle = 'Quartiles & median computed from the points with D3'

const NUM_BOXES = 6
const POINTS_PER_BOX = 100

type PointDatum = { x: number; y: number }

// Approximate a normal distribution via the central limit theorem (sum of uniforms)
const gaussian = (mean: number, sd: number): number => {
  let sum = 0
  for (let i = 0; i < 6; i++) sum += randomNumberGenerator()
  return mean + sd * ((sum - 3) / Math.sqrt(0.5))
}

// One cluster of points per box, each box with its own center and spread
const generatePoints = (): PointDatum[][] =>
  Array.from({ length: NUM_BOXES }, (_, g) => {
    const mean = 5 + 2 * Math.sin(g) + g * 0.4
    const sd = 1 + 0.4 * g
    return Array.from({ length: POINTS_PER_BOX }, () => ({ x: g, y: gaussian(mean, sd) }))
  })

// Compute the box statistics from the raw points using D3's `quantile`,
// with Tukey whiskers (the most extreme points within 1.5 * IQR of the quartiles).
const computeBox = (group: PointDatum[], x: number): BoxplotDataRecord => {
  const values = group.map(p => p.y).sort((a, b) => a - b)
  const q1 = quantile(values, 0.25)
  const median = quantile(values, 0.5)
  const q3 = quantile(values, 0.75)
  const iqr = q3 - q1
  const lowerFence = q1 - 1.5 * iqr
  const upperFence = q3 + 1.5 * iqr
  const min = values.find(v => v >= lowerFence) ?? values[0]
  const max = [...values].reverse().find(v => v <= upperFence) ?? values[values.length - 1]
  return { x, median, quartiles: [q1, q3], whiskers: [min, max] }
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const { points, boxes } = useMemo(() => {
    const groups = generatePoints()
    return {
      // Jitter the scatter x so the points spread horizontally over their box instead of stacking on a line
      points: groups.flatMap(group => group.map(p => ({ ...p, x: p.x + (randomNumberGenerator() - 0.5) * 0.5 }))),
      boxes: groups.map((group, g) => computeBox(group, g)),
    }
  }, [])

  return (
    <VisXYContainer<PointDatum | BoxplotDataRecord> margin={{ top: 5, left: 5 }} height={450}>
      <VisScatter<PointDatum>
        data={points}
        x={d => d.x}
        y={d => d.y}
        size={5}
        color='#becaeb'
        strokeColor='#ffffff'
        strokeWidth={0.5}
        duration={props.duration}
      />
      <VisBoxplot<BoxplotDataRecord>
        data={boxes}
        x={d => d.x}
        median={d => d.median}
        quartiles={d => d.quartiles}
        whiskers={d => d.whiskers}
        duration={props.duration}
      />
      <VisAxis type='x' numTicks={NUM_BOXES} duration={props.duration}/>
      <VisAxis type='y' label='Value' duration={props.duration}/>
    </VisXYContainer>
  )
}
