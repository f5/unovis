<script lang='ts'>
  import type { NumericAccessor } from '@unovis/ts'
  import { VisXYContainer, VisAxis, VisArea, VisBulletLegend, CurveType } from '@unovis/svelte'
  import { countries, Country, data, DataRecord } from './data'

  const x = (_: DataRecord, i: number) => i
  const accessors = (id: Country): { y: NumericAccessor<DataRecord>; color: string } => ({
    y: (d: DataRecord) => d.cases[id],
    color: countries[id].color,
  })
  const xTicks = (i: number): string => `${data[i].month} ${data[i].year}`
  const yTicks = Intl.NumberFormat(navigator.language, { notation: 'compact' }).format
</script>

<VisXYContainer data={data} height={400}>
  <VisBulletLegend items={Object.values(countries)}/>
  <VisArea {x} {...accessors(Country.UnitedStates)} opacity={0.7} curveType={CurveType.Basis}/>
  <VisArea {x} {...accessors(Country.India)} opacity={0.7} curveType={CurveType.Basis}/>
  <VisAxis type='x' tickFormat={xTicks}/>
  <VisAxis type='y' tickFormat={yTicks}/>
</VisXYContainer>

