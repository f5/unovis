import { PropItem } from '../utils/snippet'
import { indentLines, propValueToString } from '../utils/text'

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
      : propValueToString(v, propTypes?.[k]?.type?.name ?? typeof v)

    return { key: k, type, value }
  })
}
