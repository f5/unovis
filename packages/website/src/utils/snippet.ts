import { AxisConfigInterface, SingleContainerConfigInterface } from '@site/../ts'
import { parse, parseForESLint } from '@typescript-eslint/parser'
import { FrameworkTabsProps } from '@site/src/components/FrameworkTabs'
import { indentLines, kebabCase, nestLines, wrap, wrapIfDefined } from './text'
import beautify from 'js-beautify'
import { XYContainerConfigInterface } from '@unovis/ts'
import template from ''

// Types
export type UiFramework = keyof Omit<FrameworkTabsProps, 'data'>

export type PropItem = {
  key: string;
  value: string;
  type?: string;
}

export type SnippetComponent = {
  name: string;
  props: PropItem[];
  dataType?: string;
  rawProps?: Record<string, unknown>;
  propTypes?: Record<string, string>;
  isMain?: boolean;
  isStandAlone?: boolean;
  isContainer?: boolean;
}

export type SnippetContext = {
  imports?: Record<string, string[]>;
  declarations?: Record<string, string>;
  title?: string;
}

export type SnippetConfig = SnippetContext & {
  components: SnippetComponent[];
}

export interface Snippet<T extends UiFramework> {
  compact: FrameworkTabsProps[T];
  full: FrameworkTabsProps[T];
}

export abstract class CodeSnippet<T extends UiFramework> implements Snippet<T> {
  imports: Record<string, string[]>
  declarations: Record<string, string>
  components: string[] = []
  container?: string
  main?: string
  exampleName: string
  libraryImports: string[]

  _container?: SnippetComponent
  _components: SnippetComponent[]

  abstract componentImport (name: string): string;
  abstract componentString (c: SnippetComponent): string;

  abstract get compact(): FrameworkTabsProps[T];
  abstract get full(): FrameworkTabsProps[T];

  constructor (config: SnippetConfig) {
    this.imports = { ...config.imports }
    this.declarations = { ...config.declarations }
    this.exampleName = config.title ?? 'Component'
    this._components = []
    config.components.forEach(c => {
      if (c.isContainer) this._container = c
      else this._components.push(c)
    })

    const componentNames = new Set<string>()
    config.components.forEach(c => {
      componentNames.add(this.componentImport(c.name))
      if (c.isContainer) this.container = this.componentString(c)
      else this.components.push(this.componentString(c))
    })
    this.libraryImports = [...componentNames]
  }
}

function getImportStrings (imports: Record<string, string[]>): string[] {
  return Object.keys(imports).map(i => `import { ${imports[i].join(', ')} } from '${i}'`)
}

function getDeclarationStrings (declarations: Record<string, string>, prefix = ''): string[] {
  return Object.entries(declarations).map(d => `${prefix}${d.join(' = ')}`)
}

function getComponentString (prefix: string, attributes: string[] = [], suffix: string, sep = ' '): string {
  if (!attributes.length) return [prefix, suffix].join('')
  const breakLine = prefix.length + attributes.join(sep).length + suffix.length > 75
  const content = breakLine
    ? indentLines(attributes.map(a => `${a}${sep}`), 1 + (prefix.length - prefix.trimStart().length) / 2)
    : ` ${attributes.join(sep)}`

  return [prefix, content, suffix].join(breakLine ? '\n' : '')
}

export function nestElement (component: string, children: string[], between = '><'): string[] {
  const i = component.indexOf(between)
  return [component.slice(0, i + 1), indentLines(children, 1), component.slice(i + 1)]
}

export class AngularSnippet extends CodeSnippet<'angular'> {
  componentImport (name: string): string { return `Vis${name}Module` }
  componentString (c: SnippetComponent): string {
    const attrs = c.props?.map(({ key, value, type }) => {
      if (['function', 'object'].includes(type) ||
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
      if (type === 'function') {
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
    return this.components.join('\n')
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
  componentString (c: SnippetComponent): string {
    let data
    const attrs = c.props?.reduce((acc, { key, value }) => {
      if (key === 'data') data = true
      else acc.push(key === value ? key : [key, value].join(': '))
      return acc
    }, [])
    const prefix = `new ${c.name}${c.dataType ? `<${c.dataType}>` : ''}(${c.isContainer || c.isStandAlone ? 'document.getElementById(\'#id\'), ' : ''}{`
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

  private _componentDeclarations = {}

  constructor (config) {
    super(config)
    const containerConfig: Record<string, string[]> = {}
    config.components.forEach(c => {
      if (!c.isContainer) {
        const key = this.configKey(c)
        if (!containerConfig[key]) containerConfig[key] = []
        containerConfig[key].push(this.componentString(c))
      }
    })
    const varName = this.exampleName.charAt(0).toLowerCase().concat(this.exampleName.slice(1))
    const containerConfig2: PropItem[] = Object.entries(containerConfig).map(([k, v]) => ({
      key: k,
      value: k === 'components' ? indentLines(nestLines('[]', v, '[]')) : v[0],
    }))

    this._componentDeclarations = this.container ? {
      [varName]: this.componentString({
        ...this._container,
        props: this._container.props.concat(containerConfig2),
      }),
    } : containerConfig
  }

  get full (): string {
    return [
      ...getImportStrings(this.imports),
      ...getDeclarationStrings(this.declarations, 'const '),
      '',
      ...getDeclarationStrings(this._componentDeclarations, 'const '),
    ].join('\n')
  }

  get compact (): string {
    return ''
  }
}


type SnippetComponent2<T> = {
  name: string;
  props: T;
  propTypes: Record<keyof T, string>;
  isMain?: boolean;
}

type SnippetConfig2 = {
  imports?: Record<string, string[]>;
  declarations?: Record<string, string>;
  components: SnippetComponent2<unknown>;
  container?: SnippetComponent2<XYContainerConfigInterface<unknown> | SingleContainerConfigInterface<unknown>>;
}

export type FSnippet<T extends UiFramework> = (config: SnippetConfig2) => {
  compact: FrameworkTabsProps[T];
  full: FrameworkTabsProps[T];
}

// export const reactSnippet: FSnippet<'react'> = (config) => {
//   const { imports, declarations, components, container } = config
//   const component = ({ name, props, propTypes }): string => {
//     const attrs = Object.entries(props).map(([k, v]) => {
//       if (typeof v === 'object')
//       [key, type === 'string' ? value : `{${type === 'function' ? `useCallback(${value}, [])` : value}}`].join('=')
//     )
//     const tag = `Vis${c.name}`
//     const endLine = c.isContainer ? `></${tag}>` : '/>'
//     return getComponentString(`<${tag}`, attrs, endLine)
//   }

// }
// export function tsSnippet (config: SnippetConfig2) {
//   if (config.container) {

//   }
//   const containerConfig: Record<string, string[]> = {}
//     config.components.forEach(c => {
//       if (!c.isContainer) {
//         const key = this.configKey(c)
//         if (!containerConfig[key]) containerConfig[key] = []
//         containerConfig[key].push(this.componentString(c))
//       }
//     })
//     const varName = this.exampleName.charAt(0).toLowerCase().concat(this.exampleName.slice(1))
//     const containerConfig2: PropItem[] = Object.entries(containerConfig).map(([k, v]) => ({
//       key: k,
//       value: k === 'components' ? indentLines(nestLines('[]', v, '[]')) : v[0],
//     }))

//     this._componentDeclarations = this.container ? {
//       [varName]: this.componentString({
//         ...this._container,
//         props: this._container.props.concat(containerConfig2),
//       }),
//     } : containerConfig
// }
