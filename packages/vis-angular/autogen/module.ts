// Copyright (c) Volterra, Inc. All rights reserved.

import { kebabCase } from './utils'

export function getModuleCode (componentName: string, kebabCaseName?: string): string {
  return `// !!! This code was automatically generated. You should not change it !!!
import { NgModule } from '@angular/core'
import { Vis${componentName}Component } from './${kebabCaseName ?? kebabCase(componentName)}.component'

@NgModule({
  imports: [],
  declarations: [Vis${componentName}Component],
  exports: [Vis${componentName}Component],
})
export class Vis${componentName}Module {}
`
}
