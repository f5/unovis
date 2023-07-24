import { CodeSnippetProps, FrameworkTabsProps } from '@site/src/components/FrameworkTabs'
import { Framework } from '@site/src/types/code'
import { indent, indentLines, kebabCase, trimLines } from '@site/src/utils/text'
import { useDynamicImport } from 'docusaurus-plugin-react-docgen-typescript/pkg/dist-src/hooks/useDynamicImport'

/* constant values for formatting code blocks */
const lineMaxLength = 70
const indentLength = 2

export const tab = (level = 1): string => ' '.repeat(indentLength * level)
export const t = tab()

/*
 * Joins the prefix, list of attributes, and suffix into a formatted string, splitting the attributes into new lines
 * if the length becomes too long
 * @param prefix
 * @param attributes
 * @param suffix
 * @param sep
 * @returns
 */
function formatElement (prefix: string, attributes: string[] = [], suffix: string, sep = ' '): string {
  if (!attributes.length) return [prefix, suffix].join('\n')
  const breakLine = prefix.length + attributes.join(sep).length + suffix.length > lineMaxLength
  const indent = tab(1 + (prefix.length - prefix.trimStart().length) / 2)
  const content = breakLine
    ? `${indent}${attributes.join(`${sep}\n${indent}`)}`
    : ` ${attributes.join(sep)}`
  return [prefix, content, suffix].join(breakLine ? '\n' : '')
}

function formatElement2 (prefix: string, attributes: string[], suffix: string, sep = ''): string[] {
  if (!attributes.length) return [prefix, suffix]
  const breakLine = prefix.length + attributes.join(sep).length + suffix.length > lineMaxLength
  const tab = indent(1 + (prefix.length - prefix.trimStart().length) / 2)
  return [prefix, ...(breakLine ? attributes.map(a => `${tab}${a}`) : [` ${attributes.join(sep)}`]), suffix]
}

/*
 * Converts a mapping source, module[] pairs to a es6 import declaration string
 * @param imports: Record<string, string[]> i.e { lib: [m1, m2, ...mn] }
 * @param indent: boolean
 * @returns `import { m1, m2, ...mn } from 'lib'`
 */
function getImportString (imports: Record<string, string[]>, indent?: boolean): string {
  return `${Object.keys(imports).map(i => `${indent ? t : ''}import { ${imports[i].join(', ')} } from '${i}'`).join('\n')}`
}

function getDeclarationString (declarations: Record<string, string>, indent?: boolean, prefix = ''): string {
  return Object.entries(declarations).map(d => `${indent ? t : ''}${prefix}${d.join(' = ')}`).join(`${indent ? t : ''}\n`)
}

export type PropInfo = {
  key: string;
  value: string;
  type?: string;
}

export type SnippetComponent = {
  name: string;
  props?: PropInfo[];
}

export type SnippetContext = {
  imports?: Record<string, string[]>;
  declarations?: Record<string, string>;
  title?: string;
}

export type SnippetConfig = SnippetContext & {
  container?: SnippetComponent;
  components: SnippetComponent[];
  mode?: 'compact' | 'full';
}


export type UiFramework = keyof Omit<FrameworkTabsProps, 'data'>
// export type GeneratedTemplate<T = keyof UiFramework, Snippets = FrameworkTabsProps[UiFramework]> = (config: SnippetConfig) => {
//   compact: { [Property in keyof Snippets]: string };
//   full: { [Property in keyof Snippets]: string };
// }
export abstract class CodeSnippet<T extends UiFramework> {
  imports: Record<string, string[]>
  declarations: Record<string, string>
  container?: string// { name: string; props: string[]}
  components: string[]// { name: string; props: string[]}[]

  componentLibrary: string
  importedComponents = new Set<string>()

  abstract get compact(): FrameworkTabsProps[T]
  abstract get full(): FrameworkTabsProps[T]

  abstract componentImport: (name: string) => string
  abstract componentString(name: string, props: PropInfo[], isContainer?: boolean): string;

  constructor (ctx: SnippetContext) {
    this.components = []
    this.imports = { ...ctx.imports }
    this.declarations = { ...ctx.declarations }
  }

  addComponent (name: string, props: PropInfo[], isContainer?: boolean): void {
    this.importedComponents.add(this.componentImport(name))
    if (isContainer) this.container = this.componentString(name, props, isContainer)
    else this.components.push(this.componentString(name, props))
  }
}

export class AngularSnippet extends CodeSnippet<'angular'> {
  componentLibrary = '@unovis/angular'
  componentImport = (name: string): string => `Vis${name}Module`

  componentString (name: string, props: PropInfo[]): string {
    const attrs = props?.map(({ key, value, type }) => {
      if (type === 'function') {
        this.declarations[key] = value
        value = key
      }
      return (type === 'string' ? [key, value] : [`[${key}]`, `"${value}"`]).join('=')
    })
    const tag = `vis-${kebabCase(name)}`
    return formatElement(`<${tag}`, attrs, `></${tag}>`)
  }

  private get html (): string[] {
    if (this.container) {
      const i = this.container?.indexOf('><')
      return [this.container.slice(0, i + 1), indentLines(this.components, 1), this.container.slice(i + 1)]
    }
    return this.components
  }

  get full (): FrameworkTabsProps['angular'] {
    return {
      component: trimLines([
        getImportString({ '@angular/core': ['Component'], ...this.imports }),
        '',
        'Component({',
        '  templateUrl: \'./component.html\'',
        '})',
        'export class Component {',
        getDeclarationString(this.declarations, true, ''),
        '}',
      ]),
      template: this.html.join('\n'),
    }
  }

  get compact (): FrameworkTabsProps['angular'] {
    return { component: getDeclarationString(this.declarations, false), template: indentLines(this.html) }
  }
}

//   getSnippets (): {
//     return {
//       component:
//     }
//   }
// }

// export const snippetGenerator = (ctx: SnippetContext): SnippetGenerator<SnippetWrapper> => {
//   const frameworks = [
//     new AngularSnippet(ctx),
//   ]
//   return {
//     addComponent: (name, props, isContainer) => frameworks.forEach(f => f.addComponent(name, props, isContainer)),
//   }
// }

// function parseAngular ({ name, props }: SnippetComponent): string {
//   const attrs = props?.map(({ key, value, type }) =>
//     [type === 'string' ? key : `[${key}]`, `"${value}"`].join('=')
//   )
//   const tag = `vis-${kebabCase(name)}`
//   return formatElement(`<${tag}`, attrs, `></${tag}>`)
// }

function parseReact ({ name, props }: SnippetComponent, closing = false, indent?: number): string {
  const attrs = props?.map(({ key, value, type }) =>
    [key, type === 'string' ? `"${value}"` : `{${type === 'function' ? `useCallback(${value}, [])` : value}}`].join('=')
  )
  const tag = `Vis${name}`
  const endLine = closing ? `></${tag}>` : '/>'
  return formatElement(`${tab(indent)}<${tag}`, attrs, endLine, ' ', `${tab(indent)}${endLine}`)
}

function parseSvelte ({ name, props }: SnippetComponent, closing = false): string {
  const attrs = props?.map(({ key, value, type }) =>
    key === value ? `{${key}}` : [key, type === 'string' ? `"${value}"` : `{${value}}`].join('=')
  )
  const tag = `Vis${name}`
  const endLine = closing ? `></${tag}>` : '/>'
  return formatElement(`<${tag}`, attrs, endLine)
}

function parseTypescript (name: string, props: PropInfo[], type?: string, el?: boolean, data?: boolean): string {
  const attrs = props?.map(({ key, value, type }) =>
    key === value ? key : [key, type === 'string' ? `"${value}"` : `${value}`].join(': ')
  )
  const prefix = `new ${name}${type ? `<${type}>` : ''}(${el ? 'node, ' : ''}{`
  const suffix = data ? ' }, data)' : ' })'
  return formatElement(prefix, attrs, suffix, ', ', suffix.trim())
}

export function propValueToString (value: any, type: string): string {
  if (!value) return ''
  try {
    if (typeof value === 'function') {
      const types = type?.match(/Accessor<(?<t>[a-zA-Z<,>]*)>/)
      const params = {
        i: 'number',
        d: types?.[1],
      }
      const fn = String(value).split('=>')
      const args = fn[0].match(/[a-z]/gm)?.map(p => params[p] ? [p, params[p]].join(': ') : p).join(', ') || ''
      const body = fn[1].replace(/(\+|-|\*|\/|=|&|\||\?|:)+/gm, s => ` ${s} `)
      return `(${args}) => ${body}`
    }
    if (value instanceof HTMLElement) {
      return 'document.body'
    }
    if (typeof value === 'string') {
      return `"${value}"`
    }
    if (typeof value !== 'object') {
      return String(value)
    }
    return JSON.stringify(value).replace(/\s+/g, ' ').trim()
  } catch (e) {
    console.log('hello? error', e)
  }
}

// export const angularSnippets: SnippetTemplate<'angular'> = (config) => {
//   const { components, container, declarations, imports, title } = config
//   const { '@unovis/angular': modules, ...rest } = imports

//   const importString = getImportString(rest)

//   const component = ({ name, props }: SnippetComponent): string => {
//     const attrs = props?.map(({ key, value, type }) => {
//       if (type === 'function') {
//         declarations[key] = value
//         value = key
//       }
//       return [type === 'string' ? key : `[${key}]`, `"${value}"`].join('=')
//     })
//     const tag = `vis-${kebabCase(name)}`
//     return formatElement(`<${tag}`, attrs, `></${tag}>`)
//   }

//   const html = container
//     ? component(container).replace('><', `>\n${t}${components.map(c => component(c)).join(`\n${t}`)}\n<`)
//     : components.map(c => component(c)).join('\n')

//   return {
//     compact: {
//       component: [
//       importString,
//       '',
//       '@Component({',
//       `  template: \`${indentLines(html.split('\n'))}\``,
//       '})',
//       `export class ${title} {`,
//       getDeclarationString(declarations, true, ''),
//       '}'
//     ].join('\n'),
//     full: {
//       component: '',
//       template: '',
//       module: '',
//     },
//   }

// lines.push(getImportString(rest))
// lines.push('')
// lines.push('@Component({')
// const template = inlineTemplate
//   ? `  template: ${html.includes('\n') ? `\`\n    ${html.split('\n').join('\n    ')}\n  \`` : `'${html}'`}`
//   : '  templateUrl: \'template.html\''
// lines.push(template)
// lines.push('})')
// lines.push(`export class ${componentName} {`)
// lines.push(getDeclarationString(declarations, true, ''))
// lines.push('}')

export function getAngularStrings (config: SnippetConfig): CodeSnippetProps['angular'] {
  const { components, container, declarations, imports, mode, title } = config
  const items = { ...declarations }

  const lines = []

  const component = ({ name, props }: SnippetComponent): string => {
    const attrs = props?.map(({ key, value, type }) => {
      if (type === 'function') {
        items[key] = value
        value = key
      }
      return [type === 'string' ? key : `[${key}]`, `"${value}"`].join('=')
    })
    const tag = `vis-${kebabCase(name)}`
    return formatElement(`<${tag}`, attrs, `></${tag}>`)
  }

  const inlineTemplate = mode === 'compact'
  const componentName = title

  const html = container
    ? component(container).replace('><', `>\n${t}${components.map(c => component(c)).join(`\n${t}`)}\n<`)
    : components.map(c => component(c)).join('\n')

  const { '@unovis/angular': modules, ...rest } = imports

  lines.push(getImportString(rest))
  lines.push('')
  lines.push('@Component({')
  const template = inlineTemplate
    ? `  template: ${html.includes('\n') ? `\`\n    ${html.split('\n').join('\n    ')}\n  \`` : `'${html}'`}`
    : '  templateUrl: \'template.html\''
  lines.push(template)
  lines.push('})')
  lines.push(`export class ${componentName} {`)
  lines.push(getDeclarationString(items, true, ''))
  lines.push('}')
  // if (imports || Object.values(declarations).length) {
  //   tsLines.push(getImportString(imports))

  //   tsLines.push('@Component({')
  //   const template = inlineTemplate
  //     ? `  template: ${html.includes('\n') ? `\`\n    ${html.split('\n').join('\n    ')}\n  \`` : `'${html}'`}`
  //     : '  templateUrl: \'template.html\''
  //   tsLines.push(template)
  //   tsLines.push('})')

  //   if (data || Object.values(rest).length) {
  //     tsLines.push(`export class ${componentName} {`)
  //     // if (data) tsLines.push(`${t}@Input ${data};`)
  //     tsLines.push(...Object.entries(rest).map(d => `${t}${d.join(' = ')}`))
  //     tsLines.push('}')
  //   }
  // }
  // const modules = imports['@unovis/angular']
  return {
    template: inlineTemplate ? undefined : html,
    component: lines.length ? lines.join('\n') : undefined,
    module: [
      'import { NgModule } from \'@angular/core\'',
      getImportString({ '@unovis/angular': modules }),
      `import { ${componentName}Component from './component'`,
      '',
      '@NgModule({',
      `${t}imports: [${modules}],`,
      `${t}declarations: [${componentName}Component],`,
      `${t}exports: [${componentName}Component],`,
      '})',
      `export class ${componentName}Module {}`,
    ].join('\n'),
  }
}

export function getReactStrings (config: SnippetConfig): string {
  const { imports, declarations, container, components } = config
  const lines = []
  let indentLevel = 0
  let containerString: string
  console.log('declarations', declarations)

  lines.push(getImportString(imports))
  lines.push('')
  lines.push('function Component (): JSX.Element {')
  lines.push(getDeclarationString(declarations, true, 'const '))
  lines.push(`${t}return (`)
  indentLevel += 2

  if (container) {
    containerString = `${parseReact(container, true, indentLevel)}`
    indentLevel++
  }
  const componentString = `${components.map(c => parseReact(c, false, indentLevel)).join('\n')}`
  lines.push(containerString?.replace('><', `>\n${componentString}\n${tab(--indentLevel)}<`) || componentString)

  if (indentLevel) {
    lines.push(`${tab(--indentLevel)})`)
    if (indentLevel) lines.push('}')
  }
  return lines.join('\n')
}

export function getSvelteStrings (config: SnippetConfig): string {
  const { components, container, declarations, imports, mode } = config
  const lines: string[] = []

  const component = ({ name, props }, closing = false): string => {
    const attrs = props.map(({ key, value, type }) => {
      if (type === 'function') {
        declarations[key] = value
        value = key
      }
      return key === value ? `{${key}}` : [key, type === 'string' ? `"${value}"` : `{${value}}`].join('=')
    })
    const tag = `Vis${name}`
    const endLine = closing ? `></${tag}>` : '/>'
    return formatElement(`<${tag}`, attrs, endLine)
  }

  const html = container
    ? parseSvelte(container, true).replace('><', `>\n${t}${components.map(c => component(c)).join(`\n${t}`)}\n<`)
    : components.map(c => parseSvelte(c)).join('\n')

  if (mode === 'compact') return html

  lines.push(getImportString(imports, true))
  lines.push(getDeclarationString(declarations, true, 'const '))
  return `<script lang='ts'>\n${lines.join('\n')}\n</script>\n\n${html}`
}


export function getTypescriptStrings (config: SnippetConfig): string {
  const { components, container, declarations, imports, mode, title } = config

  const component = ({ name, props }, el = false, t?: string): string => {
    let data = false
    const attrs = props?.reduce((acc, { key, value, type }) => {
      if (key === 'data') data = true
      else acc.push(key === value ? key : [key, type === 'string' ? `"${value}"` : `${value}`].join(': '))
      return acc
    }, [])
    const prefix = `new ${name}${t ? `<${t}>` : ''}(${el ? 'node, ' : ''}{`
    const suffix = data ? ' }, data)' : ' })'
    return formatElement(prefix, attrs, suffix, ', ')
  }

  const getKey = (c): string => {
    switch (c.name) {
      case 'Tooltip':
        return 'tooltip'
      case 'Crosshair':
        return 'crosshair'
      case 'Axis':
        return `${c.props.find(p => p.key === 'type').value}Axis`
      default:
        if (container) return `component${container.name === 'XYContainer' ? 's' : ''}`
        return c.name.charAt(0).toLowerCase().concat(c.name.slice(1))
    }
  }

  const containerConfig: Record<string, string[]> = {}

  components.forEach(c => {
    const key = getKey(c)
    if (!containerConfig[key]) containerConfig[key] = []
    containerConfig[key].push(component(c))
  })

  const componentDecs = container ? {
    [title]: component({
      name: container.name,
      props: container.props.concat(Object.entries(containerConfig).map(([k, v]) => ({
        key: k,
        value: k === 'components' ? `[${v.toString().length > 10 ? `\n${tab(2)}${v.join(`\n${tab(2)}`)}\n${t}` : v.join(', ')}]` : v.join(','),
      }))),
    }),
  } : containerConfig
  // const c = component({ name: container.name, props: container.props.concat(Object.entries(componentDeclarations).map(([k, v]) => ({ key, value })) }
  return [
    getImportString(imports),
    '',
    getDeclarationString(declarations, false, 'const '),
    '',
    getDeclarationString(componentDecs, false, 'const '),
  ].join('\n')
}
