// Copyright (c) Volterra, Inc. All rights reserved.

import { kebabCase } from './utils'
import { ConfigProperty, GenericParameter } from './types'

function getJSDocComments (jsdocStringArray: string[]): string {
  return jsdocStringArray.map(jsdoc => {
    const strings = (jsdoc || '')
      // eslint-disable-next-line no-irregular-whitespace
      .replace(/ /g, '\\')
      .split('\n')

    for (let i = 1; i < strings.length; i += 1) {
      strings[i] = `   * ${strings[i]}`
    }

    return `/** ${strings.join('\n')} */`
  }).join('\n')
}

export function getComponentCode (
  componentName: string,
  generics: GenericParameter[],
  configProps: ConfigProperty[],
  provide: string,
  importStatements: { source: string; elements: string[] }[],
  dataType = 'any',
  kebabCaseName?: string
): string {
  const genericsStr = generics ? `<${generics?.map(g => g.name).join(', ')}>` : ''
  const genericsDefStr = generics
    ? `<${generics?.map(g => g.name + (g.extends ? ` extends ${g.extends}` : '') + (g.default ? ` = ${g.default}` : '')).join(', ')}>`
    : ''
  return `/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n')}
import { ${provide} } from '../../core'

@Component({
  selector: 'vis-${kebabCaseName ?? kebabCase(componentName)}',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: ${provide}, useExisting: Vis${componentName}Component }],
})
export class Vis${componentName}Component${genericsDefStr} implements ${componentName}ConfigInterface${genericsStr}, AfterViewInit {
${
  configProps
    .map((p: ConfigProperty) => `
      ${getJSDocComments(p.doc ?? [])}
      @Input() ${p.name}: ${p.type}`)
    .join('\n')
}
  ${dataType ? `@Input() data: ${dataType}` : ''}


  component: ${componentName}${genericsStr} | undefined

  ngAfterViewInit (): void {
    this.component = new ${componentName}${genericsStr}(this.getConfig())
    ${dataType ? 'if (this.data) this.component.setData(this.data)' : ''}
  }

  ngOnChanges (changes: SimpleChanges): void {
    ${dataType ? 'if (changes.data) { this.component?.setData(this.data) }' : ''}
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
