import { FrameworkTabsProps } from '@site/src/components/FrameworkTabs'
import { indentLines, kebabCase } from '@site/src/utils/text'

import { CodeSnippet, PropItem } from '../types'
import { getComponentString, getDeclarationStrings, getImportStrings, nestElement } from '../helpers'

export class AngularSnippet extends CodeSnippet<'angular'> {
  componentImport (name: string): string { return `Vis${name}Module` }
  componentString (name: string, props: PropItem[]): string {
    const attrs = props.map(({ key, value, type }) => {
      if (['function', 'object'].includes(type) ||
        Object.values(this.imports).flatMap(v => v).includes(value)) {
        this.declarations[key] = value
        value = key
      }
      return (type === 'string' ? [key, value] : [`[${key}]`, `"${value}"`]).join('=')
    })
    const tag = `vis-${kebabCase(name)}`
    return getComponentString(`<${tag}`, attrs, `></${tag}>`)
  }

  get full (): FrameworkTabsProps['angular'] {
    return {
      component: [
        ...getImportStrings({ '@angular/core': ['Component'], ...this.imports }),
        '',
        'Component({',
        '  templateUrl: \'./component.html\'',
        '})',
        'export class Component {',
        indentLines(getDeclarationStrings(this.declarations), 1),
        '}',
      ].join('\n'),
      template: (this.container ? nestElement(this.container, this.components) : this.components).join('\n'),
      module: [
        'import { NgModule } from \'@angular/core\'',
        ...getImportStrings({ '@unovis/angular': this.libraryImports }),
        'import { Component } from \'./component\'',
        '',
        '@NgModule({',
        `  imports: [$${this.libraryImports.join(', ')}],`,
        `  declarations: [${this.exampleName}Component],`,
        `  exports: [${this.exampleName}Component],`,
        '})',
        `export class ${this.exampleName}Module {}`,
      ].join('\n'),
    }
  }

  get compact (): FrameworkTabsProps['angular'] {
    return {
      component: getDeclarationStrings(this.declarations).join('\n'),
      template: (this.container ? nestElement(this.container, this.components) : this.components).join('\n'),
    }
  }
}
