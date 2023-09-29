import { Component } from '@angular/core'
import { ColorAccessor, NumericAccessor, CurveType } from '@unovis/ts'
import { data, countries, Country, DataRecord } from './data'

@Component({
  selector: 'non-stacked-area-chart',
  templateUrl: './non-stacked-area-chart.component.html',
})
export class NonStackedAreaComponent {
  data = data
  legendItems = Object.values(countries)

  curveType: CurveType.Basis
  x: NumericAccessor<DataRecord> = (_, i) => i
  accessors = (id: Country): {
    y: NumericAccessor<DataRecord>;
    color: ColorAccessor<DataRecord>;
  } => ({ y: d => d.cases[id], color: countries[id].color })

  xTicks = (i: number): string => `${data[i].month} ${data[i].year}`
  yTicks = Intl.NumberFormat(navigator.language).format

  ind = this.accessors(Country.India)
  usa = this.accessors(Country.UnitedStates)
}
