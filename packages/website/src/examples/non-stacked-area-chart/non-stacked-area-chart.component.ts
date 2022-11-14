import { Component } from '@angular/core'
import { data, countries, Country, DataRecord } from './data'

@Component({
  selector: 'non-stacked-area-chart',
  templateUrl: './non-stacked-area-chart.component.html',
})
export class NonStackedAreaComponent {
  data = data
  legendItems = Object.values(countries)

  x = (_: DataRecord, i: number) => i
  accessors = (id: Country) => ({
    y: (d: DataRecord) => d.cases[id],
    color: countries[id].color,
  })

  xTicks = (i: number): string => `${data[i].month} ${data[i].year}`
  yTicks = Intl.NumberFormat(navigator.language, { notation: 'compact' }).format

  ind = this.accessors(Country.India)
  usa = this.accessors(Country.UnitedStates)
}
