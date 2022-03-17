// Copyright (c) Volterra, Inc. All rights reserved.

import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'volterra-vis'
  get darkmode (): boolean {
    return document.body.classList.contains('theme-dark')
  }

  toggleTheme (): void {
    document.body.classList.toggle('theme-dark')
  }
}
