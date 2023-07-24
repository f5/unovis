export const indent = (indentLevel: number, tabLength = 1): string => ' '.repeat(indentLevel * tabLength)

export function kebabCase (str: string): string {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    ?.filter(Boolean)
    .map(x => x.toLowerCase())
    .join('-')
}

export function trimMultiline (str: string): string {
  const s = str.substring(str.indexOf('\n') + 1).trimEnd()
  const indent = ' '.repeat(s.length - s.trim().length)
  const re = new RegExp(indent, 'g')
  return str.replace(re, '')
}

export const indentLines = (lines: string[], level = 0): string => {
  return `${indent(level)}${lines.flatMap(line => line.split('\n').map(l => `${indent(level)}${l}`)).join(`\n${indent(level)}`)}`
}

export function nestLines (component: string, children: string[], between = '><'): string[] {
  const i = component.indexOf(between)
  return [component.slice(0, i + 1), indentLines(children, 1), component.slice(i + 1)]
}

export function wrap (content: string, prefix = '', suffix = ''): string {
  return `${prefix}${content}${suffix}`
}

export function wrapIfDefined (content?: string, prefix?: string, suffix?: string): string {
  return content ? '' : wrap(content, prefix, suffix)
}

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
    const res = str?.match(/\(?(?<params>[a-zA-Z\s:,\[\]]*)\)?\s?=>/)
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
