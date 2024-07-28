import useIsBrowser from '@docusaurus/useIsBrowser'
import { kebabCase } from '@site/src/utils/text'
import { DocComponent } from '../wrappers/types'

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

function parseFunction (str: string, type: string): string {
  const types = type.split(',')
  const params = {
    i: 'number',
    d: types[0],
    ...Object.fromEntries(types.map(t => [t.toLowerCase().charAt(0), t])),
  }
  const fn = str.split('=>')
  const args = fn[0].match(/[a-z]/gm)?.map(p => params[p] ? [p, params[p]].join(': ') : p).join(', ') || ''
  const body = fn[1].startsWith('`') ? fn[1] : fn[1].replace(/(\+|-|\*|\/|=|&|\||\?|:)+/gm, s => ` ${s} `)
  return `(${args}) => ${body}`
}

export function parseObject (value: unknown, type: string, level = 1): string {
  if (!value) return ''
  if (typeof value === 'function') {
    const str = String(value)
    return parseFunction(str, type)
  }
  if (useIsBrowser() && value instanceof HTMLBodyElement) {
    return 'document.body'
  }
  if (typeof value === 'string') {
    return `\`${value}\``
  }
  if (typeof value !== 'object') {
    return String(value)
  }

  if (typeof value[Symbol.iterator] === 'function') {
    const items = value.map(v => parseObject(v, type, level + 1)).join(', ')
    return `[${items.length > 50
      ? `\n${tab(level + 1)}${items.replaceAll(', ', `,\n${tab(level + 1)}`)}\n${tab(level)}`
      : items}]`
  }
  const objectProps = Object.entries(value).map(([k, v]) => `${tab(level + 1)}${[k, parseObject(v, type, level + 1)].join(': ')}`)
  return `{\n${objectProps.join(',\n')}\n${tab(level)}}`
}

export function parseProps (component: DocComponent, dataType: string, imports: string[], declarations: Record<string, string>): ComponentInfo {
  return {
    ...component,
    props: Object.entries(component.props).map(([k, v]) => {
      const isStringLiteral = typeof v === 'string' && !declarations[k] && (
        imports === undefined || imports.findIndex(i => v?.startsWith(i)) === -1
      )
      if (declarations[k]) {
        v = k
      } else if (typeof v === 'object' || typeof v === 'function') {
        if ((v.length && typeof v[0] === 'number') || !declarations) {
          v = JSON.stringify(v)
        } else {
          declarations[k] = parseObject(v, dataType) || k
          v = k
        }
      }
      return ({ key: k, value: String(v), stringLiteral: isStringLiteral })
    }),
  }
}

function parseAngular ({ name, props }: ComponentInfo): string {
  const attrs = props?.map(({ key, value, stringLiteral }) =>
    [stringLiteral ? key : `[${key}]`, `"${value}"`].join('=')
  )
  const tag = `vis-${kebabCase(name)}`
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

function parseSvelte ({ name, props }: ComponentInfo, closing = false): string {
  const attrs = props?.map(({ key, value, stringLiteral }) =>
    key === value ? `{${key}}` : [key, stringLiteral ? `"${value}"` : `{${value}}`].join('=')
  )
  const tag = `Vis${name}`
  const endLine = closing ? `></${tag}>` : '/>'
  return formatElement(`<${tag}`, attrs, endLine)
}

function parseVue ({ name, props }: ComponentInfo, closing = false, indent = 0): string {
  const attrs = props?.map(({ key, value, stringLiteral }) => [stringLiteral ? `${key}` : `:${key}`, `"${value}"`].join('='))
  const tag = `Vis${name}`
  const endLine = closing ? `></${tag}>` : ' />'
  return formatElement(`${tab(indent)}<${tag}`, attrs, endLine, ' ', `${tab(indent)}${endLine}`)
}

function parseSolid ({ name, props }: ComponentInfo, closing = false, indent?: number): string {
  const attrs = props?.map(({ key, value, stringLiteral }) =>
    [key, stringLiteral ? `"${value}"` : `{${value}}`].join('=')
  )
  const tag = `Vis${name}`
  const endLine = closing ? `></${tag}>` : '/>'
  return formatElement(`${tab(indent)}<${tag}`, attrs, endLine, ' ', `${tab(indent)}${endLine}`)
}

function parseTypescript (name: string, props: PropInfo[], type?: string, el?: boolean, data?: boolean): string {
  const attrs = props?.map(({ key, value, stringLiteral }) =>
    key === value ? key : [key, stringLiteral ? `"${value}"` : `${value}`].join(': ')
  )
  const prefix = `new ${name}${type ? `<${type}>` : ''}(${el ? 'node, ' : ''}{`
  const suffix = data ? ' }, data)' : ' })'
  return formatElement(prefix, attrs, suffix, ', ', suffix.trim())
}

export const parseComponent = {
  angular: parseAngular,
  react: parseReact,
  svelte: parseSvelte,
  vue: parseVue,
  solid: parseSolid,
  typescript: parseTypescript,
}
