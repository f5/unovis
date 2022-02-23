// Copyright (c) Volterra, Inc. All rights reserved.
import { PropItem } from 'react-docgen-typescript'

export interface FrameworkProps {
  angularProps: string;
  reactProps: string;
  typescriptProps: string;
  contextProps?: string[];
}

type PropParser = { (k: string, v: PropItem): string }

const getReactProps: PropParser = (k, v) => [k, typeof v === 'string' ? `"${v}"` : `{${k}}`].join('=')
const getNgProps: PropParser = (k, v) => [typeof v !== 'string' ? `[${k}]` : k, `"${k}"`].join('=')
const getTsProps: PropParser = (k, v) => [k, typeof v === 'string' ? `"${v}"` : `${k}`].join(': ')
const getContextProps: PropParser = (k, v) => {
  let str = String(v)
  if (typeof v === 'object') {
    str = `d=>[${str.split(',').join(', ')}]`
  }
  str = str.replace('d=>', '(d: DataRecord) => ')
  str = str.replace('(d,i)=>', '(d: DataRecord, i: number) => ')
  return [k, str].join(' = ')
}

export function parseProps (props: Record<string, PropItem>, addToContext: boolean): FrameworkProps {
  const angularProps: string[] = []
  const reactProps: string[] = []
  const typescriptProps: string[] = []
  const contextProps: string[] = []

  Object.entries(props).forEach(([k, v]) => {
    angularProps.push(getNgProps(k, v))
    reactProps.push(getReactProps(k, v))
    typescriptProps.push(getTsProps(k, v))

    if (addToContext && typeof v !== 'string') {
      contextProps.push(getContextProps(k, v))
    }
  })

  return {
    angularProps: angularProps.join(' '),
    reactProps: reactProps.join(' '),
    typescriptProps: typescriptProps.join(', '),
    contextProps,
  }
}
