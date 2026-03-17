import { kebabCase } from '@unovis/shared/integrations/utils'
import { ConfigProperty, GenericParameter } from '@unovis/shared/integrations/types'


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

function checkGeneric (type: string, generics?: GenericParameter[]): string {
  // Override the default generic with specified type from generics array
  const isFound = type.search(/[<|\s](Datum)>/)
  const isValid = generics?.find(t => t.name === 'Datum')
  if (isFound !== -1 && !isValid) {
    return `${type.slice(0, isFound + 1)}${generics[0].name}${type.slice(isFound + 6)}`
  }
  return type
}

export function getComponentCode (
  componentName: string,
  generics: GenericParameter[],
  configProps: ConfigProperty[],
  provide: string,
  importStatements: { source: string; elements: string[] }[],
  dataType = 'any',
  kebabCaseName?: string,
  isStandAlone = false,
  renderIntoProvidedDomNode = false,
  styles = []
): string {
  const genericsStr = generics ? `<${generics?.map(g => g.name).join(', ')}>` : ''
  const genericsDefStr = generics
    ? `<${generics?.map(g => g.name + (g.extends ? ` extends ${g.extends}` : '') + (g.default ? ` = ${g.default}` : '')).join(', ')}>`
    : ''
  const decoratorProps = isStandAlone ? `template: '<div #container class="${kebabCaseName ?? kebabCase(componentName)}-container"></div>',
    styles: ['.${kebabCaseName ?? kebabCase(componentName)}-container { ${styles?.join('; ')} }']`
    : 'template: \'\''
  const constructorArgs = isStandAlone
    ? `this.containerRef.nativeElement, ${renderIntoProvidedDomNode ? '{ ...this.getConfig(), renderIntoProvidedDomNode: true }' : 'this.getConfig()'}${dataType ? ', this.data' : ''}`
    : 'this.getConfig()'
  // Override the default generic with specified type from generics array
  return `// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges${isStandAlone ? ', ViewChild, ElementRef' : ''} } from '@angular/core'
${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n')}
import { ${provide} } from '../../core'

@Component({
  selector: 'vis-${kebabCaseName ?? kebabCase(componentName)}',
  ${decoratorProps},
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: ${provide}, useExisting: Vis${componentName}Component }],
  standalone: false,
})
export class Vis${componentName}Component${genericsDefStr} implements ${componentName}ConfigInterface${genericsStr}, AfterViewInit {
  ${isStandAlone ? '@ViewChild(\'container\', { static: false }) containerRef: ElementRef' : ''}
${
  configProps
    .map((p: ConfigProperty) => `
      ${getJSDocComments(p.doc ?? [])}
      @Input() ${p.name}${p.required ? '' : '?'}: ${checkGeneric(p.type, generics)}`)
    .join('\n')
}
  ${dataType ? `@Input() data: ${dataType}\n` : ''}
  component: ${componentName}${genericsStr} | undefined
  ${isStandAlone ? '' : 'public componentContainer: ContainerCore | undefined\n'}
  ngAfterViewInit (): void {
    this.component = new ${componentName}${genericsStr}(${constructorArgs})
    ${dataType ? `
      if (this.data) {
        this.component.setData(this.data)
        ${isStandAlone ? '' : 'this.componentContainer?.render()'}
      }` : ''}
  }

  ngOnChanges (changes: SimpleChanges): void {
    ${dataType ? 'if (changes.data) { this.component?.setData(this.data) }' : ''}
    this.component?.setConfig(this.getConfig())
    ${isStandAlone ? '' : 'this.componentContainer?.render()'}
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
