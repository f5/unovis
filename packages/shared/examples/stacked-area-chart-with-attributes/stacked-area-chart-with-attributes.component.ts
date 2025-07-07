import { Component, ViewEncapsulation } from '@angular/core'
import { Area } from '@unovis/ts'
import { data, countries, FoodExportData, bulletLegends } from './data'


@Component({
  selector: 'stacked-area-chart-with-attributes',
  templateUrl: './stacked-area-chart-with-attributes.component.html',
  styleUrls: ['./styles.css'],
  encapsulation: ViewEncapsulation.None,
})
export class StackedAreaWithAttributesComponent {
  data = data
  legendItems = Object.values(bulletLegends)
  x = (d: FoodExportData): number => d.year
  y = countries.map(c => (d: FoodExportData) => d[c])
  attributes = {
    [Area.selectors.area]: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'custom-stroke-styles': (_: FoodExportData, i: number): string => {
        return i === 0 ? 'true' : 'false'
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'e2e-test-id': (_: FoodExportData, i: number): string => `area-segment-${i}`,
    },
  }
}
