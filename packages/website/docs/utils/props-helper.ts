// Copyright (c) Volterra, Inc. All rights reserved.
import { PropItem } from 'react-docgen-typescript'
export interface FrameworkProps {
  componentStrings: {
    angular: string;
    react: string;
    typescript: string;
  };
  contextProps?: string[];
}
type PropParser = { (k: string, v: any): string }

const literals = ['boolean', 'number', 'string']
const isLiteral = (prop: any): boolean => literals.includes(typeof prop)
const isString = (prop: any): boolean => typeof prop === 'string'

const getReactProps: PropParser = (k, v) => [k, isString(v) ? `"${v}"` : `{${isLiteral(v) ? v : k}}`].join('=')
const getNgProps: PropParser = (k, v) => (isString(v) ? [k, `"${v}"`] : [`[${k}]`, `"${isLiteral(v) ? v : k}"`]).join('=')
const getTsProps: PropParser = (k, v) => (isLiteral(v) ? [k, isString(v) ? `"${v}"` : v].join(': ') : `${k}`)

export const getContextProps: PropParser = (k, v) => {
  let str = String(v)
  if (k === 'y' && typeof v === 'object') {
    str = `((d: DataRecord) => number)[] = [${str.split(',').join(', ')}]`
  } else if (v && typeof v === 'object') {
    str = v.length ? `[${v.toString()}]` : `{\n  ${Object.keys(v).map(k => [k, v[k].toString()].join(': ')).join(',\n  ')} \n}`
  } else {
    str = str.replace('d=>', '(d: DataRecord) => ')
    str = str.replace('(d,i)=>', '(d: DataRecord, i: number) => ')
    str = str.replace('?', ' ? ')
    str = str.replace('y>', 'y > ')
  }
  return [k, str].join(' = ')
}

export function getPropStrings (props: Record<string, any>, addToContext: boolean): FrameworkProps {
  const angularProps: string[] = []
  const reactProps: string[] = []
  const typescriptProps: string[] = []
  const contextProps: string[] = []

  Object.entries(props).forEach(([k, v]) => {
    if (!isLiteral(v) && addToContext) {
      contextProps.push(getContextProps(k, v))
    }
    angularProps.push(getNgProps(k, v))
    reactProps.push(getReactProps(k, v))
    typescriptProps.push(getTsProps(k, v))
  })
  return {
    componentStrings: {
      angular: angularProps.join(' '),
      react: reactProps.join(' '),
      typescript: typescriptProps.join(', '),
    },
    contextProps,
  }
}

function getHtmlTag (name: string): string {
  const hasUpper = name.match(/.+[A-Z]/)
  if (hasUpper) {
    const ch = name[hasUpper[0].length - 1]
    name = name.split(ch).join('-'.concat(ch))
  }
  return name.toLowerCase()
}

function getChartConfig (name: string, key: string, value: string): string {
  if (!key) {
    return value.replace(', ', ',\n  ')
  }
  value = `new ${name} ({${value}})`
  if (key === 'components') {
    value = `[${value}]`
  }
  return [key, value].join(': ')
}

export function parseProps (name: string, props: Record<string, PropItem>, addToContext: boolean, xyConfigKey: string): FrameworkProps {
  const { componentStrings, contextProps } = getPropStrings(props, addToContext)
  const tag = getHtmlTag(name)
  const pad = (props: string): string => props.length ? ` ${props}` : ''
  return {
    componentStrings: {
      angular: `<vis-${tag}${pad(componentStrings.angular)}></vis-${tag}>`,
      react: `<Vis${name}${pad(componentStrings.react)}/>`,
      typescript: `${getChartConfig(name, xyConfigKey, componentStrings.typescript)}`,
    },
    contextProps,
  }
}

type XYConfigArgs = {
  name: string;
  props: any;
  key: string;
}
export function parseXYConfig (config: XYConfigArgs[]): FrameworkProps {
  const contextProps = []
  const items = config.reduce((obj, { name, props, key }) => {
    const { componentStrings, contextProps: ctx } = parseProps(name, props, true, key)
    Object.entries(componentStrings).forEach(([k, v]) => {
      obj[k].push(v)
    })
    if (ctx.length) ctx.forEach(d => contextProps.push(d))
    return obj
  }, { angular: [], react: [], typescript: [] })
  return {
    componentStrings: {
      angular: items.angular.join('\n  '),
      react: items.react.join('\n      '),
      typescript: items.typescript.join(',\n  '),
    },
    contextProps,
  }
}
