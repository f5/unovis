import { Children, ReactElement, ReactNode } from 'react'
import { isEqual } from '@unovis/ts/utils/data'

// Compares two prop objects, skipping `children` and comparing `data` by reference:
// datasets can be large, so deep-comparing them on every render is too expensive
function arePropValuesEqual<PropTypes> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  const propKeys = Array.from(new Set([...Object.keys(prevProps ?? {}), ...Object.keys(nextProps ?? {})])) as (keyof PropTypes)[]
  for (const key of propKeys) {
    if (key === 'children') continue
    if (key === 'data') {
      if (prevProps?.[key] !== nextProps?.[key]) return false
      continue
    }
    if (!(isEqual(prevProps?.[key], nextProps?.[key]))) return false
  }

  return true
}

export function arePropsEqual<PropTypes extends { children?: ReactNode }> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  if (typeof prevProps.children !== typeof nextProps.children) return false

  if (prevProps.children && nextProps.children) {
    const prevChildren = Children.toArray(prevProps.children) as ReactElement[]
    const nextChildren = Children.toArray(nextProps.children) as ReactElement[]
    if (prevChildren.length !== nextChildren.length) return false

    for (let i = 0; i < nextChildren.length; i += 1) {
      if (!arePropValuesEqual(prevChildren[i]?.props, nextChildren[i]?.props)) return false
    }
  }

  return arePropValuesEqual(prevProps, nextProps)
}
