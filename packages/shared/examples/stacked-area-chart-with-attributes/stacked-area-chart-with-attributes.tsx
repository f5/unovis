import { useCallback } from 'react'
import { Area } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisArea, VisBulletLegend } from '@unovis/react'
import { data, countries, FoodExportData, bulletLegends } from './data'
import './styles.css'

export default function StackedArea (): JSX.Element {
  return (
    <>
      <VisXYContainer data={data} height={'50dvh'}>
        <VisBulletLegend items={Object.values(bulletLegends)} />
        <VisArea
          attributes={{
            [Area.selectors.area]: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'custom-stroke-styles': (_: FoodExportData, i: number): string => {
                return i === 0 ? 'true' : 'false'
              },
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'e2e-test-id': (_: FoodExportData, i: number): string => `area-segment-${i}`,
            },
          }}
          x={useCallback((d: FoodExportData) => d.year, [])}
          y={countries.map((g) => useCallback((d: FoodExportData) => d[g], []))}
        />
        <VisAxis
          type="x"
          label="Year"
          numTicks={10}
          gridLine={false}
          domainLine={false}
        />
        <VisAxis
          type="y"
          label="Food Exports(% of merchandise exports)"
          numTicks={10}
        />
      </VisXYContainer>
    </>
  )
}
