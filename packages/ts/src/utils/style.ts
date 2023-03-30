import { injectGlobal } from '@emotion/css'

import { kebabCaseToCamel } from 'utils/text'
import type { KebabToCamelCase, RemovePrefix } from 'utils/type'

export function getCssVarNames<
  T extends Record<string, unknown>,
  Prefix extends string = '--vis-',
> (cssVarsObject: T, prefix?: Prefix): {
  [Property in Extract<keyof T, string> as KebabToCamelCase<RemovePrefix<Property, Prefix>>]: Property
} {
  const defaultPrefix = '--vis-'
  const entries = Object.entries(cssVarsObject)
  return Object.fromEntries(
    entries.map(([key]) => [kebabCaseToCamel(key.replace(prefix ?? defaultPrefix, '')), key])
  ) as {
    [Property in Extract<keyof T, string> as KebabToCamelCase<RemovePrefix<Property, Prefix>>]: Property
  }
}

export function injectGlobalCssVariables<T extends Record<string, string | undefined>> (
  cssVarsObject: T,
  componentRootClassName: string
): void {
  injectGlobal({
    ':root': cssVarsObject,
    [`body.theme-dark .${componentRootClassName}`]: Object.keys(cssVarsObject)
      .filter(key => key.includes('--vis-dark'))
      .map(key => ({
        [key.replace('--vis-dark', '--vis')]: `var(${key})`,
      })),
  })
}

export function cssvar<T extends string> (name: T): `var(${T})` {
  return `var(${name})` as `var(${T})`
}
