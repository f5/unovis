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
  duration: number | undefined
  numTicks = 10

  legendItems: LegendItem[] = groups.map(g => ({ ...g, inactive: false }))

  x = (d: DataRecord) => d.year
  y = this.legendItems.map((i: LegendItem) => (d: DataRecord) => i.inactive ? null : d[i.key])

  updateDomain = (selection: [number, number], _, userDriven: boolean): void => {
    if (userDriven) {
      this.numTicks = Math.min(15, this.domain[1] - this.domain[0])
      this.duration = 0 // We set duration to 0 to update the main chart immediately (without animation) after the brush event
      this.domain = selection
    }
  }

  updateItems = (item: LegendItem, index: number): void => {
    item.inactive = !item.inactive
    this.legendItems = [...this.legendItems]
    this.legendItems[index].inactive = item.inactive
    this.duration = undefined // Enabling default animation duration for legend interactions
    this.y = this.legendItems.map((i: LegendItem) => (d: DataRecord) => i.inactive ? null : d[i.key])
  }
}
