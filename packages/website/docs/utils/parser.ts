import useIsBrowser from '@docusaurus/useIsBrowser'

export type PropInfo = {
  key: string;
  value: string;
  stringLiteral: boolean;
}

export type ComponentInfo = {
  name: string;
  props: PropInfo[];
  key?: string;
}

/* constant values for formatting code blocks */
const lineMaxLength = 70
const indentLength = 2

export const tab = (level = 1): string => ' '.repeat(indentLength * level)
export const t = tab()


function formatElement (prefix: string, attributes: string[] = [], suffix: string, sep = ' ', lineBreakSuffix = suffix): string {
  const breakLine = prefix.length + attributes.join(sep).length + suffix.length > lineMaxLength
  const indent = tab(1 + (prefix.length - prefix.trimStart().length) / 2)
  const content = !(attributes.length) ? '' : (
    breakLine
      ? `${indent}${attributes.join(`${sep}\n${indent}`)}`
      : ` ${attributes.join(sep)}`
  )
  return [prefix, content, breakLine ? lineBreakSuffix : suffix].join(breakLine ? '\n' : '')
}

export function parseObject (value: any, type: string, level = 1): string {
  if (!value) return ''
  if (typeof value === 'function') {
    let str = String(value)
    str = str.replace(/d=>/gm, `(d: ${type}) => `)
    str = str.replace(/\(d,i\)=>/gm, `(d: ${type}, i: number) => `)
    str = str.replace(/d.y>/gm, 'd.y > ')
    str = str.replace(/\?/gm, ' ? ')
    str = str.replace(/\+/gm, ' + ')
    str = str.replace(/,undefined/gm, '')
    return str
  }
  if (useIsBrowser() && value instanceof HTMLBodyElement) {
    return 'document.body'
  }
  if (typeof value !== 'object') {
    return String(value)
  }
  if (value.length) {
    return `[${value.map(v => parseObject(v, type, level + 1)).join(', ')}]`
  }
  const objectProps = Object.entries(value).map(([k, v]) => `${tab(level + 1)}${[k, parseObject(v, type, level + 1)].join(': ')}`)
  return objectProps.length && `{\n${objectProps.join(',\n')}\n${tab(level)}}`
}

export function parseProps (props: Record<string, any>, dataType: string, imports?: string[], declarations?: Record<string, string>): PropInfo[] {
  return props && Object.entries(props).map(([k, v]) => {
    const isStringLiteral = typeof v === 'string' && !declarations[k] && (
      imports === undefined || imports.findIndex(i => v?.startsWith(i)) === -1
    )
    if (declarations[k]) {
      v = k
    } else if (typeof v === 'object' || typeof v === 'function') {
      if ((v.length && typeof v[0] === 'number') || !declarations) {
        v = parseObject(v, dataType) || k
      } else {
        declarations[k] = parseObject(v, dataType) || k
        v = k
      }
    }
    return ({
      key: k,
      value: String(v),
      stringLiteral: isStringLiteral,
    })
  })
}

function parseAngular ({ name, props }: ComponentInfo): string {
  const hasUpper = name.match(/.+[A-Z]/)
  if (hasUpper) {
    const ch = name[hasUpper[0].length - 1]
    name = name.split(ch).join('-'.concat(ch))
  }
  const attrs = props?.map(({ key, value, stringLiteral }) =>
    [stringLiteral ? key : `[${key}]`, `"${value}"`].join('=')
  )
  const tag = `vis-${name.toLowerCase()}`
  return formatElement(`<${tag}`, attrs, `></${tag}>`)
}

function parseReact ({ name, props }: ComponentInfo, closing = false, indent?: number): string {
  const attrs = props?.map(({ key, value, stringLiteral }) =>
    [key, stringLiteral ? `"${value}"` : `{${value}}`].join('=')
  )
  const tag = `Vis${name}`
  const endLine = closing ? `></${tag}>` : '/>'
  return formatElement(`${tab(indent)}<${tag}`, attrs, endLine, ' ', `${tab(indent)}${endLine}`)
}

function parseTypescript (prefix: string, { name, props }: ComponentInfo, type?: string): string {
  const attrs = props?.map(({ key, value, stringLiteral }) =>
    key === value ? key : [key, stringLiteral ? `"${value}"` : `${value}`].join(': ')
  )
  return formatElement(`${prefix}new ${name}${type ? `<${type}>` : ''}({`, attrs, ' })', ', ', '})')
}

export const parseComponent = {
  angular: parseAngular,
  react: parseReact,
  typescript: parseTypescript,
}
