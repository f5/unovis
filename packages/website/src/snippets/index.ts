import { AxisConfigInterface, SingleContainerConfigInterface } from '@unovis/ts'
import { FrameworkTabsProps } from '../../src/components/FrameworkTabs'
import { getComponentString, getDeclarationStrings, getImportStrings, indentLines, nestElement, parseProps } from './helpers'
import { kebabCase } from '../utils/text'

export type UiFramework = keyof Omit<FrameworkTabsProps, 'data' | 'showStackBlitzButton' >

export type PropItem = {
  key: string;
  value: string;
  type?: string;
}

export type SnippetComponentInput<T> = {
  name: string;
  rawProps: T;
  propTypes?: Record<string, string>;
  isMain?: boolean;
  isStandAlone?: boolean;
  isContainer?: boolean;
}

export type SnippetComponent = SnippetComponentInput<unknown> & {
  props: PropItem[];
}

export type SnippetContext = {
  imports?: Record<string, string[]>;
  declarations?: Record<string, string>;
  title?: string;
  dataType?: string;
}

export type SnippetConfig = SnippetContext & {
  components: SnippetComponentInput<unknown>[];
}

export interface Snippet<T extends UiFramework> {
  compact: FrameworkTabsProps[T];
  full: FrameworkTabsProps[T];
}

export abstract class CodeSnippet<T extends UiFramework> implements Snippet<T> {
  imports: Record<string, string[]>
  declarations: Record<string, string>
  dataType: string
  components: string[] = []
  container?: string
  exampleName: string
  libraryImports: string[]

  _container?: SnippetComponent
  _components: SnippetComponent[] = []

  abstract componentImport (name: string): string;
  abstract componentString (c: SnippetComponent): string;

  abstract get compact(): FrameworkTabsProps[T];
  abstract get full(): FrameworkTabsProps[T];

  constructor (config: SnippetConfig) {
    this.imports = { ...config.imports }
    this.declarations = { ...config.declarations }
    this.exampleName = config.title ?? 'Chart'
    this.dataType = config.dataType

    const importedProps = Object.values(this.imports).flatMap(d => d)
    const componentNames = new Set<string>()

    config.components.forEach(c => {
      componentNames.add(this.componentImport(c.name))
      const component = {
        ...c,
        props: parseProps(c.rawProps, c.propTypes, this.declarations, importedProps),
      }
      if (c.isContainer) {
        this._container = component
        this.container = this.componentString(component)
      } else {
        this._components.push(component)
        this.components.push(this.componentString(component))
      }
    })
    this.libraryImports = [...componentNames]
  }

  relevantDeclarations (component: SnippetComponent): Record<string, string> {
    const obj = {}
    component.props.forEach(p => {
      if (Object.keys(this.declarations).includes(p.key)) {
        obj[p.key] = this.declarations[p.key]
      }
    })
    return obj
  }
}

export class AngularSnippet extends CodeSnippet<'angular'> {
  componentImport (name: string): string { return `Vis${name}Module` }
  componentString (c: SnippetComponent): string {
    const attrs = c.props?.map(({ key, value, type }) => {
      if (['function', 'function[]', 'object'].includes(type) ||
        Object.values(this.imports).flatMap(v => v).includes(value)) {
        this.declarations[key] = value
        value = key
      }
      return (type === 'string' ? [key, value] : [`[${key}]`, `"${value}"`]).join('=')
    })
    const tag = `vis-${kebabCase(c.name)}`
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
        `  imports: [${this.libraryImports.join(', ')}],`,
        `  declarations: [${this.exampleName}Component],`,
        `  exports: [${this.exampleName}Component],`,
        '})',
        `export class ${this.exampleName}Module {}`,
      ].join('\n'),
    }
  }

  get compact (): FrameworkTabsProps['angular'] {
    const mainComponent = this._components.find(c => c.isMain)
    const declarations = getDeclarationStrings(this.relevantDeclarations(mainComponent))
    return {
      component: declarations.length ? declarations.join('\n') : undefined,
      template: this.components.join('\n'),
    }
  }
}

export class ReactSnippet extends CodeSnippet<'react'> {
  componentImport (name: string): string { return `Vis${name}` }

  componentString (c: SnippetComponent): string {
    const attrVal = (value: string, type: string): string => {
      switch (type) {
        case 'function':
          return `useCallback(${value}, [])`
        case 'function[]':
          return `useMemo(${value}, [])`
        default:
          return value
      }
    }
    const attrs = c.props?.map(({ key, value, type }) =>
      [key, type === 'string' ? value : `{${attrVal(value, type)}}`].join('=')
    )
    const tag = `Vis${c.name}`
    const endLine = c.isContainer ? `></${tag}>` : '/>'
    return getComponentString(`<${tag}`, attrs, endLine)
  }

  get compact (): string {
    return this.components.join('\n')
  }

  get full (): string {
    return [
      ...getImportStrings({ '@unovis/react': this.libraryImports, ...this.imports }),
      '',
      `export function ${this.exampleName} (): JSX.Element {`,
      ...getDeclarationStrings(this.declarations, '  const '),
      '  return (',
      indentLines(this.container ? nestElement(this.container, this.components) : this.components, 2),
      '  )',
      '}',
    ].join('\n')
  }
}


export class SvelteSnippet extends CodeSnippet<'svelte'> {
  componentImport (name: string): string { return `Vis${name}` }

  componentString (c: SnippetComponent): string {
    const attrs = c.props.map(({ key, value, type }) => {
      if (type.startsWith('function')) {
        this.declarations[key] = value
        value = key
      }
      return key === value ? `{${key}}` : [key, type === 'string' ? value : `{${value}}`].join('=')
    })
    const tag = `Vis${c.name}`
    const endLine = c.isContainer ? `></${tag}>` : '/>'
    return getComponentString(`<${tag}`, attrs, endLine)
  }

  get compact (): string {
    const mainComponent = this._components.find(c => c.isMain)
    const compProps = mainComponent.props.map(p => {
      if (p.type.startsWith('function')) {
        return { ...p, type: 'string', value: `"${p.value.replace(/:\s\w*/gm, '')}"` }
      }
      return p
    })
    return this.componentString({
      ...mainComponent,
      props: compProps,
    })
  }

  get full (): string {
    return [
      '<script lang=\'ts\'>',
      indentLines(getImportStrings({ '@unovis/svelte': this.libraryImports, ...this.imports }), 1),
      ...getDeclarationStrings(this.declarations, '  const '),
      '</script>',
      '',
      indentLines(this.container ? nestElement(this.container, this.components) : this.components, 0),
    ].join('\n')
  }
}

export class TypescriptSnippet extends CodeSnippet<'typescript'> {
  componentImport (c: string): string { return c }
  componentString (c: SnippetComponent, showGeneric = c.propTypes?.data !== undefined): string {
    let data
    const attrs = c.props?.reduce((acc, { key, value }) => {
      if (key === 'data') data = true
      else acc.push(key === value ? key : [key, value].join(': '))
      return acc
    }, [])
    const prefix = `new ${c.name}${showGeneric ? `<${this.dataType}>` : ''}(${c.isContainer || c.isStandAlone ? 'document.getElementById(\'#id\'), ' : ''}{`
    const suffix = data ? ' }, data)' : ' })'
    return getComponentString(prefix, attrs, suffix, ', ')
  }

  private configKey = (c: SnippetComponent): string => {
    switch (c.name) {
      case 'Tooltip':
        return 'tooltip'
      case 'Crosshair':
        return 'crosshair'
      case 'Axis':
        return `${(c.rawProps as AxisConfigInterface<any>).type}Axis`
      default:
        return this._container.name === 'XYContainer' ? 'components' : 'component'
    }
  }

  private get varName (): string {
    return this.exampleName.charAt(0).toLowerCase().concat(this.exampleName.slice(1))
  }

  private get componentDeclarations (): Record<string, string> {
    if (this._container) {
      const containerConfig: Record<string, string[]> = {}
      this._components.forEach(c => {
        if (!c.isContainer) {
          const key = this.configKey(c)
          if (!containerConfig[key]) containerConfig[key] = []
          containerConfig[key].push(this.componentString(c, false))
        }
      })
      const componentProps = Object.entries(containerConfig).map(([k, v]) => ({
        key: k,
        value: k === 'components' ? indentLines(nestElement('[]', v, '[]')) : v[0],
      }))

      return {
        [this.varName]: this.componentString({
          ...this._container,
          props: this._container?.props.concat(componentProps),
        }, true),
      }
    }
    return Object.fromEntries(this._components.map(c => [c.name.toLowerCase()]))
  }

  get full (): string {
    return [
      ...getImportStrings({ '@unovis/ts': this.libraryImports, ...this.imports }),
      ...getDeclarationStrings(this.declarations, 'const '),
      '',
      ...getDeclarationStrings(this.componentDeclarations, 'const '),
    ].join('\n')
  }

  get compact (): string {
    const mainComponent = this._components.find(c => c.isMain)
    return mainComponent
      ? `const ${this.varName} = ${this.componentString(mainComponent)}`
      : getDeclarationStrings(this.componentDeclarations, 'const ')
  }
}
