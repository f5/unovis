import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'state-migration-balance',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './state-migration-balance.component.html',
  styleUrls: ['./styles.css'],
})
export class StateMigrationBalanceComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state)

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state)
  }

  changeSort (event: Event): void {
    this.update({ sort: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
