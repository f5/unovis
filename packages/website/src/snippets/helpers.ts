import { PropItem, SnippetComponent } from './index'

// General formatting
export const indent = (indentLevel: number, tabLength = 1): string => ' '.repeat(indentLevel * tabLength)

export const indentLines = (lines: string[], level = 0): string => {
  return `${indent(level)}${lines.flatMap(line => line.split('\n').map(l => `${indent(level)}${l}`)).join(`\n${indent(level)}`)}`
}

// Snippet structure
export function getImportStrings (imports: Record<string, string[]>): string[] {
  return Object.keys(imports).map(i => `import { ${imports[i].join(', ')} } from '${i}'`)
}

export function getDeclarationStrings (declarations: Record<string, string>, prefix = ''): string[] {
  return Object.entries(declarations).map(d => `${prefix}${d.join(' = ')}`)
}

export function getComponentString (prefix: string, attributes: string[] = [], suffix: string, sep = ' '): string {
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

// Parsing props
export const getType = (t): string => {
  switch (t) {
    case 'Datum':
      return 'DataRecord'
    case 'SankeyNode':
      return 'NodeDatum'
    case 'SankeyLink':
      return 'LinkDatum'
    default:
      return ''
  }
}

export function getParamString (fn: string, type: string): string {
  const params = (str: string): string[] => {
    const res = str?.match(/\(?(?<params>[a-zA-Z\s:,[\]]*)\)?\s?=>/)
    return res?.groups?.params?.split(',')
  }
  const ts = type.includes('=>')
    ? params(type).map(s => s?.split(':')[1].trim())
    : [getType(type?.match(/Accessor<(?<generic>[a-zA-Z]*)(?<ts><.*>)?>/)?.groups?.generic), 'number']
  return params(fn).map((p, i) => ts[i] ? [p, ts[i]?.trim()].join(': ') : p).join(', ')
}

export function propValueToString (value: any, type: string, indentLevel = 0): string {
  if (!value) return ''
  if (typeof value === 'function') {
    const fn = String(value).split('=>')
    const args = getParamString(String(value), type)
    const body = fn[1].replace(/(\+|-|\*|\/|=|&|\||\?|:)+/gm, s => ` ${s} `)
    return `(${args}) => ${body}`
  }
  if (typeof value === 'string') {
    return `"${value}"`
  }
  if (typeof value !== 'object') {
    return String(value)
  }
  if (value instanceof Array && value.length && ['function', 'object'].includes(typeof value[0])) {
    return `[\n${indentLines(value.map(v => `${propValueToString(v, type)},`), indentLevel + 1)}\n${indent(indentLevel)}]`
  }
  return JSON.stringify(value, null, indentLevel)
}

export function parseProps<T> (
  props: T,
  propTypes?: Record<keyof T, string>,
  declarations?: Record<string, string>,
  importedProps?: string[]
): PropItem[] {
  return Object.entries(props).map(([k, v]) => {
    const fromImports = typeof v === 'string' && (
      importedProps?.includes(v) || importedProps?.includes(v?.split('.')?.[0])
    )
    const customValue = declarations?.[k] || fromImports
    const type = customValue ? 'object' : (v instanceof Array && v.length ? `${typeof v[0]}[]` : typeof v)
    const value = customValue
      ? (declarations?.[k] ?? v)
      : propValueToString(v, propTypes?.[k] ?? typeof v)

    return { key: k, type, value }
  })
}
