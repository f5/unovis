import useIsBrowser from '@docusaurus/useIsBrowser'

export type PropInfo = {
  key: string;
  value: string;
  stringLiteral: boolean;
}

/* constant values for formatting code blocks */
const lineMaxLength = 80
const indentLength = 2

export const tab = (level = 1): string => ' '.repeat(indentLength * level)
export const t = tab()

export function formatElement (prefix: string, attributes: string[] = [], suffix: string, sep = ' '): string {
  const breakLine = prefix.length + attributes.join(sep).length + suffix.length > lineMaxLength
  const content = !(attributes.length) ? '' : (
    breakLine
      ? `${t}${attributes.join(`${sep}\n${t}`)}`
      : ` ${attributes.join(sep)}`
  )
  return [prefix, content, breakLine ? suffix.trimStart() : suffix].join(breakLine ? '\n' : '')
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
    const isStringLiteral = typeof v === 'string' && (
      imports === undefined || imports.findIndex(i => v?.startsWith(i)) === -1
    )
    if (typeof v === 'object' || typeof v === 'function') {
      if (declarations) {
        declarations[k] = parseObject(v, dataType) || k
        v = k
      } else {
        v = parseObject(v, dataType)
      }
    }
    return ({
      key: k,
      value: String(v),
      stringLiteral: isStringLiteral,
    })
  })
}
