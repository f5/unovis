import { Component } from '@angular/core'
import { largeSize } from '@unovis/ts'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Unovis'
  classList = ['vis-container', 'with-border-lines', largeSize]

  get darkmode (): boolean {
    return document.body.classList.contains('theme-dark')
  }

  toggleTheme (): void {
    document.body.classList.toggle('theme-dark')
  }
}
