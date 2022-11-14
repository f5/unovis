import React, { useCallback } from 'react'
import { NumericAccessor } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisArea, VisBulletLegend } from '@unovis/react'
import { countries, Country, data, DataRecord } from './data'

export default function NonStackedArea (): JSX.Element {
  const x = useCallback((_: DataRecord, i: number) => i, [])
  const accessors = (id: Country): { y: NumericAccessor<DataRecord>; color: string } => ({
    y: useCallback((d: DataRecord) => d.cases[id], []),
    color: countries[id].color,
  })
  const xTicks = useCallback((i: number) => [data[i].month, data[i].year].join(''), [])
  const yTicks = Intl.NumberFormat(navigator.language, { notation: 'compact' }).format
  return (
    <VisXYContainer data={data} height={400}>
      <VisBulletLegend items={Object.values(countries)}/>
      <VisArea {...accessors(Country.UnitedStates)} x={x} opacity={0.7}/>
      <VisArea {...accessors(Country.India)} x={x} opacity={0.6}/>
      <VisAxis type='x' tickFormat={xTicks}/>
      <VisAxis type='y' tickFormat={yTicks}/>
    </VisXYContainer>
  )
}
