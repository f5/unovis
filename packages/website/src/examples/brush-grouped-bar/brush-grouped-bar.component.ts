import { Component } from '@angular/core'
import { BulletLegendItemInterface } from '@volterra/vis'
import { data, groups, DataRecord, GroupItem } from './data'

type LegendItem = BulletLegendItemInterface & GroupItem

@Component({
  selector: 'brush-grouped-bar',
  templateUrl: './brush-grouped-bar.component.html',
})
export class BrushGroupedBarComponent {
  data = data
  domain = [1980, 1990]
  margin: { top: 20, left: 60 }

  legendItems: LegendItem[] = groups.map(g => ({ ...g, inactive: false }))

  x = (d: DataRecord) => d.year
  y = this.legendItems.map((i: LegendItem) => (d: DataRecord) => i.inactive ? null : d[i.key])

  updateItems = (item: LegendItem, index: number): void => {
    item.inactive = !item.inactive
    this.legendItems = [...this.legendItems]
    this.legendItems[index].inactive = item.inactive
    this.y = this.legendItems.map((i: LegendItem) => (d: DataRecord) => i.inactive ? null : d[i.key])
  }

  updateDomain = (selection: [number, number]): void => {
    if (selection) this.domain = selection
  }
}
