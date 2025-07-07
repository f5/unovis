import { JSX } from 'solid-js'
import { Area } from '@unovis/ts'
import { VisArea, VisAxis, VisBulletLegend, VisXYContainer } from '@unovis/solid'
import { data, countries, FoodExportData, bulletLegends } from './data'
import './styles.css'

const StackedAreaChart = (): JSX.Element => {
  const x = (d: FoodExportData) => d.year
  const y = countries.map((g) => (d: FoodExportData) => d[g])
  const attributes = {
    [Area.selectors.area]: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'custom-stroke-styles': (_: FoodExportData, i: number): string => {
        return i === 0 ? 'true' : 'false'
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'e2e-test-id': (_: FoodExportData, i: number): string => `area-segment-${i}`,
    },
  }
  return (
    <VisXYContainer data={data} height='50dvh'>
      <VisBulletLegend items={Object.values(bulletLegends)} />
      <VisArea x={x} y={y} attributes={attributes}/>
      <VisAxis
        type='x'
        label='Year'
        numTicks={10}
        gridLine={false}
        domainLine={false}
      />
      <VisAxis type='y' label='Food Exports(% of merchandise exports)' numTicks={10} />
    </VisXYContainer>
  )
}

export default StackedAreaChart
