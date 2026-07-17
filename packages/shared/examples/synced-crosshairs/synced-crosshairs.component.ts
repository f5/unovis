import { Component } from '@angular/core'
import { data, accessors, XYDataRecord } from './data'

@Component({
  selector: 'synced-crosshairs',
  templateUrl: './synced-crosshairs.component.html',
})
export class SyncedCrosshairsComponent {
  data = data
  accessors = accessors
  presets = [0, 25, 50, 75, 100, 125]
  forcePosition: number | undefined = 75

  x = (d: XYDataRecord): number => d.x

  template = (d: XYDataRecord): string =>
    `Forced at: ${this.forcePosition}<br/>Data: ${d.x}`

  onCrosshairMove = (x: number | Date | undefined): void => {
    this.forcePosition = typeof x === 'number' ? x : undefined
  }

  setForcePosition (value: number | undefined): void {
    this.forcePosition = value
  }

  onRangeInput (event: Event): void {
    this.forcePosition = Number((event.target as HTMLInputElement).value)
  }
}
