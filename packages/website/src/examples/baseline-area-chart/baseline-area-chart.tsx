import React, { useCallback, useMemo } from 'react'
import { VisArea, VisAxis, VisBulletLegend, VisXYContainer } from '@unovis/react'
import { CurveType } from '@unovis/ts'

import { categories, Category, data, DataRecord } from './data'

export default function BaselineAreaChart (): JSX.Element {
  const sums = data.map(d => d.art.reduce((t, i) => t + i, 0))
  const max = Math.max(...sums)

  const yTicks = Array(Math.round(max / 1000)).fill(0).map((_, i) => {
    const dir = i % 2 === 1 ? -(i - 1) : i
    return max / 2 + dir * 1000
  })

  const x = useCallback((d: DataRecord) => d.year, [])
  const y = useCallback((c: Category) => (d: DataRecord) => d.art[c.id], [])
  const color = useCallback((c: Category) => c.color, [])
  const baseline = useCallback((_: DataRecord, i: number) => (max - sums[i]) / 2, [])

  return (
    <div>
      <VisBulletLegend items={categories}/>
      <VisXYContainer data={data} height={'50vh'}>
        <VisArea
          x={x}
          y={useMemo(() => categories.map(y), [])}
          color={useMemo(() => categories.map(color), [])}
          baseline={baseline}
          curveType={CurveType.Basis}
        />
        <VisAxis type="x" label="Year"/>
        <VisAxis
          type="y"
          label="Number of Works Acquired"
          tickValues={yTicks}
          tickFormat={useCallback((i: number) => `${Math.abs(i - max / 2)}`, [])}
        />
      </VisXYContainer>
    </div>
  )
}
