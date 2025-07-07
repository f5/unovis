<script lang='ts'>
  import { Area } from '@unovis/ts'
  import { VisXYContainer, VisBulletLegend, VisAxis, VisArea } from '@unovis/svelte'
  import { data, countries, FoodExportData, bulletLegends } from './data'

  const x = (d: FoodExportData) => d.year
  const y = countries.map(g => (d: FoodExportData) => d[g])
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
</script>

<VisXYContainer {data} height={500}>
  <VisBulletLegend items={Object.values(bulletLegends)}/>
  <VisArea {x} {y} {attributes}/>
  <VisAxis type='x' label='Year' numTicks={10} gridLine={false} domainLine={false}/>
  <VisAxis type='y' label='Food Exports(% of merchandise exports)' numTicks={10}/>
</VisXYContainer>

<style>
  :global([custom-stroke-styles="true"]) {
    stroke-width: 1px !important;
    stroke: #FF6B7E !important;
  }
</style>
