// Copyright (c) Volterra, Inc. All rights reserved.

import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

if (environment.production) {
  enableProdMode()
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.toggle('theme-dark')
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err))
