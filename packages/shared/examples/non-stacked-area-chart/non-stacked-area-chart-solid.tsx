import { JSX } from 'solid-js'
import { VisArea, VisAxis, VisBulletLegend, VisXYContainer } from '@unovis/solid'
import { CurveType, NumericAccessor } from '@unovis/ts'

import { countries, Country, data, DataRecord } from './data'

const NonStackedAraChart = (): JSX.Element => {
  const x = (_: DataRecord, i: number) => i
  const accessors = (
    id: Country
  ): { y: NumericAccessor<DataRecord>; color: string } => ({
    y: (d: DataRecord) => d.cases[id],
    color: countries[id].color,
  })
  const xTicks = (i: number): string => `${data[i].month} ${data[i].year}`
  const yTicks = Intl.NumberFormat(navigator.language, {
    notation: 'compact',
  }).format

  return (
    <VisXYContainer data={data} height='50dvh'>
      <VisBulletLegend items={Object.values(countries)} />
      <VisArea
        x={x}
        {...accessors(Country.UnitedStates)}
        opacity={0.7}
        curveType={CurveType.Basis}
      />
      <VisArea
        x={x}
        {...accessors(Country.India)}
        opacity={0.7}
        curveType={CurveType.Basis}
      />
      <VisAxis type='x' tickFormat={xTicks} />
      <VisAxis type='y' tickFormat={yTicks} />
    </VisXYContainer>
  )
}

export default NonStackedAraChart
