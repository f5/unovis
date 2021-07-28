// Copyright (c) Volterra, Inc. All rights reserved.

import { kebabCase } from './utils'
import { ConfigProperty } from './types'

export function getComponentCode (
  componentName: string,
  generics: string[],
  configProps: ConfigProperty[],
  provide: string,
  importStatements: { source: string; elements: string[] }[],
  dataType = 'any'
): string {
  const genericsStr = generics ? `<${generics?.join(', ')}>` : ''
  return `/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n')}
import { ${componentName}, ${componentName}ConfigInterface } from '@volterra/vis'
import { ${provide} } from '../../core'

@Component({
  selector: 'vis-${kebabCase(componentName)}',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: ${provide}, useExisting: Vis${componentName}Component }],
})
export class Vis${componentName}Component${genericsStr} implements ${componentName}ConfigInterface${genericsStr}, AfterViewInit {
${
  configProps
    .map((p: ConfigProperty) => `
      /* ${p.doc.join('\n')} */
      @Input() ${p.name}: ${p.type}`)
    .join('\n')
}
  @Input() data: ${dataType}

  component: ${componentName}${genericsStr} | undefined

  ngAfterViewInit (): void {
    this.component = new ${componentName}${genericsStr}(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): ${componentName}ConfigInterface${genericsStr} {
    const { ${configProps.map(key => key.name).join(', ')} } = this
    const config = { ${configProps.map(key => key.name).join(', ')} }
    const keys = Object.keys(config) as (keyof ${componentName}ConfigInterface${genericsStr})[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
`
}
