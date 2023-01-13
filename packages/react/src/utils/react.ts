import { Children, ReactElement, ReactNode } from 'react'
import { isEqual } from '@unovis/ts'

export function arePropsEqual<PropTypes extends { children?: ReactNode }> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  if (typeof prevProps.children !== typeof nextProps.children) return false

  if (prevProps.children && nextProps.children) {
    const prevChildren = Children.toArray(prevProps.children) as ReactElement[]
    const nextChildren = Children.toArray(nextProps.children) as ReactElement[]
    if (prevChildren.length !== nextChildren.length) return false

    for (let i = 0; i < nextChildren.length; i += 1) {
      if (!isEqual(prevChildren[i]?.props, nextChildren[i]?.props)) return false
      if (!isEqual(prevChildren[i].props, nextChildren[i].props)) return false
    }
  }

  const propKeys = Array.from(new Set([...Object.keys(prevProps), ...Object.keys(nextProps)])) as (keyof PropTypes)[]
  for (const key of propKeys) {
    if (key === 'children') continue
    if (!(isEqual(prevProps[key], nextProps[key]))) return false
  }

  return true
}
