import { JSX } from 'solid-js'
import { VisArea, VisAxis, VisBulletLegend, VisXYContainer } from '@unovis/solid'
import { CurveType } from '@unovis/ts'

import { categories, Category, data, DataRecord } from './data'

const BaselineAreaChart = (): JSX.Element => {
  // Configure accessors and baseline
  const sums = data.map((d) => d.art.reduce((t, i) => t + i, 0))
  const max = Math.max(...sums)

  // Area
  const x = (d: DataRecord) => d.year
  const y = categories.map((c: Category) => (d: DataRecord) => d.art[c.id])
  const baseline = (_: DataRecord, i: number) => (max - sums[i]) / 2

  // Y Axis
  const yAxisConfig = {
    tickValues: Array(Math.round(max / 1000))
      .fill(0)
      .map((_, i) => {
        const dir = i % 2 === 1 ? -(i - 1) : i
        return max / 2 + dir * 1000
      }),
    tickFormat: (i: number) => `${Math.abs(i - max / 2)}`,
  }

  return (
    <div>
      <VisBulletLegend items={categories} />
      <VisXYContainer data={data} height='50dvh'>
        <VisArea x={x} y={y} baseline={baseline} curveType={CurveType.Basis} />
        <VisAxis type='x' label='Year' />
        <VisAxis type='y' label='Number of Works Acquired' {...yAxisConfig} />
      </VisXYContainer>
    </div>
  )
}

export default BaselineAreaChart
