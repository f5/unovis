import { Children, ReactElement, ReactNode } from 'react'
import { isEqual } from '@unovis/ts/utils/data'

// `PropTypes` is constrained to `object` rather than to `{ children?: ReactNode }`: the latter is a weak
// type (every property optional), so TypeScript rejects any argument with no property in common with it —
// which is every component's props, since only containers take children.
export function arePropsEqual<PropTypes extends object> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  const prevPropsChildren = (prevProps as { children?: ReactNode }).children
  const nextPropsChildren = (nextProps as { children?: ReactNode }).children

  if (typeof prevPropsChildren !== typeof nextPropsChildren) return false

  if (prevPropsChildren && nextPropsChildren) {
    const prevChildren = Children.toArray(prevPropsChildren) as ReactElement[]
    const nextChildren = Children.toArray(nextPropsChildren) as ReactElement[]
    if (prevChildren.length !== nextChildren.length) return false

    for (let i = 0; i < nextChildren.length; i += 1) {
      if (!isEqual(prevChildren[i]?.props, nextChildren[i]?.props)) return false
    }
  }

  const propKeys = Array.from(new Set([...Object.keys(prevProps), ...Object.keys(nextProps)])) as (keyof PropTypes)[]
  for (const key of propKeys) {
    if (key === 'children') continue
    if (!(isEqual(prevProps[key], nextProps[key]))) return false
  }

  return true
}
