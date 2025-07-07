import { Area, Axis, BulletLegend, XYContainer } from '@unovis/ts'
import { data, countries, FoodExportData, bulletLegends } from './data'
import './styles.css'

const container = document.getElementById('vis-container')
// Legend
const legend = new BulletLegend(container, { items: Object.values(bulletLegends) })

const chart = new XYContainer(container, {
  height: 500,
  components: [
    // area chart
    new Area<FoodExportData>({
      x: (d: FoodExportData) => d.year,
      y: countries?.map(f => (d: FoodExportData) => d[f]),
      attributes: {
        [Area.selectors.area]: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'custom-stroke-styles': (_: FoodExportData, i: number): string => {
            return i === 0 ? 'true' : 'false'
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'e2e-test-id': (_: FoodExportData, i: number): string => `area-segment-${i}`,
        },
      },
    }),
  ],
  xAxis: new Axis({ label: 'Year', numTicks: 10, domainLine: false, gridLine: false }),
  yAxis: new Axis({ label: 'Food Exports(% of merchandise exports)', numTicks: 10 }),
}, data)
