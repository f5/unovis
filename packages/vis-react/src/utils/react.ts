import { ReactElement, ReactNode, ReactChild, ReactFragment } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import _isEqual from 'lodash/isEqual.js'

export function arePropsEqual<PropTypes extends { children?: ReactNode }> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  if (typeof prevProps.children !== typeof nextProps.children) return false

  if (Array.isArray(prevProps.children) && Array.isArray(nextProps.children)) {
    const prevChildren = prevProps.children as ReactElement[]
    const nextChildren = nextProps.children as ReactElement[]
    if (prevChildren.length !== nextChildren.length) return false

    for (let i = 0; i < nextChildren.length; i += 1) {
      if (!_isEqual(prevChildren[i].props, nextChildren[i].props)) return false
    }
  }

  const propKeys = Array.from(new Set([...Object.keys(prevProps), ...Object.keys(nextProps)])) as (keyof PropTypes)[]
  for (const key of propKeys) {
    if (key === 'children') continue
    if (!(_isEqual(prevProps[key], nextProps[key]))) return false
  }

  return true
}
