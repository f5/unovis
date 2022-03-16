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
type PropParser = { (k: string, v: PropItem): string }

const literals = ['boolean', 'number', 'string']
const isLiteral = (prop: PropItem): boolean => literals.includes(typeof prop)
const isString = (prop: PropItem): boolean => typeof prop === 'string'

const getReactProps: PropParser = (k, v) => [k, isString(v) ? `"${v}"` : `{${isLiteral(v) ? v : k}}`].join('=')
const getNgProps: PropParser = (k, v) => (isString(v) ? [k, `"${v}"`] : [`[${k}]`, `"${isLiteral(v) ? v : k}"`]).join('=')
const getTsProps: PropParser = (k, v) => (isLiteral(v) ? [k, isString(v) ? `"${v}"` : v].join(': ') : `${k}`)

const getContextProps: PropParser = (k, v) => {
  let str = String(v)
  if (k === 'y' && typeof v === 'object') {
    str = `((d: DataRecord) => number)[] = [${str.split(',').join(', ')}]`
  } else {
    str = str.replace('d=>', '(d: DataRecord) => ')
    str = str.replace('(d,i)=>', '(d: DataRecord, i: number) => ')
    str = str.replace('?', ' ? ')
  }
  return [k, str].join(' = ')
}

function getHtmlTag (name: string): string {
  const hasUpper = name.match(/.+[A-Z]/)
  if (hasUpper) {
    const ch = name[hasUpper[0].length - 1]
    name = name.split(ch).join('-'.concat(ch))
  }
  return name.toLowerCase()
}

function getChartConfig (key: string, value: string): string {
  if (key === 'components') {
    value = `[${value}]`
  }
  return [key, value].join(': ')
}

export function parseProps (name: string, props: Record<string, PropItem>, addToContext: boolean, xyConfigKey: string): FrameworkProps {
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

  const tag = getHtmlTag(name)

  return {
    componentStrings: {
      angular: `<vis-${tag} ${angularProps.join(' ')}></vis-${tag}>`,
      react: `<Vis${name} ${reactProps.join(' ')}/>`,
      typescript: getChartConfig(xyConfigKey, `new ${name}({ ${typescriptProps.join(', ')} })`),
    },
    contextProps,
  }
}
