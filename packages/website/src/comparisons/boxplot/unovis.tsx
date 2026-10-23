import React from 'react'
import { VisXYContainer, VisBoxplot, VisScatter, VisAxis, VisCrosshair, VisTooltip } from '@unovis/react'

import type { ChartProps } from '../types'
import { BoxStats, DataRecord, getBoxStats, formatMs } from './data'

type Outlier = { index: number; value: number }

const x = (_: BoxStats, i: number): number => i

export default function UnovisBoxPlot ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // Boxplot draws the statistics you give it, so the quartiles and whiskers are computed from the samples first
  const boxes = data.map(d => getBoxStats(d, preset === 'min-max' ? 'min-max' : 'tukey'))
  // Boxplot doesn't draw outliers: a Scatter in the same container does
  const outliers = boxes.flatMap((b, index) => b.outliers.map(value => ({ index, value })))
  const color = preset === 'colors' ? (_: BoxStats | Outlier, i: number) => `var(--vis-color${i})` : undefined
  const minMax = preset === 'min-max'
  const tooltipTemplate = (d: BoxStats): string => `
    <b>${d.endpoint}</b>
    <div>${minMax ? 'Max' : 'Upper whisker'}: ${formatMs(d.high)}</div>
    <div>Q3: ${formatMs(d.q3)}</div>
    <div>Median: ${formatMs(d.median)}</div>
    <div>Q1: ${formatMs(d.q1)}</div>
    <div>${minMax ? 'Min' : 'Lower whisker'}: ${formatMs(d.low)}</div>
  `

  return (
    // The container's `data` would replace the components' own, so each component gets its data directly
    <VisXYContainer height={320}>
      <VisBoxplot<BoxStats>
        data={boxes}
        x={x}
        median={d => d.median}
        quartiles={d => [d.q1, d.q3]}
        whiskers={d => [d.low, d.high]}
        color={color}
        {...(preset === 'rounded' ? { roundedCorners: 8 } : {})}
      />
      <VisScatter<Outlier>
        data={outliers}
        x={d => d.index}
        y={d => d.value}
        color={color ? (d: Outlier) => color(null, d.index) : undefined}
      />
      <VisAxis type="x" numTicks={boxes.length} tickFormat={(i: number) => boxes[i]?.endpoint} gridLine={false}/>
      <VisAxis type="y" tickFormat={formatMs}/>
      <VisCrosshair<BoxStats> data={boxes} x={x} template={tooltipTemplate} getCircles={() => []}/>
      <VisTooltip container={document.body}/>
    </VisXYContainer>
  )
}
