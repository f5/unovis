import { useSearchParams } from 'react-router-dom'
import { isPlainObject } from '@unovis/ts'

import { COMPONENT_CONFIG_RESERVED_KEYS } from './constants'
import { updateExampleSearchParams } from './updateSearchParams'

export function useComponentConfig<T extends object> (component: string, props: T): {
  config: T;
  setConfig: <K extends keyof T>(key: K, value: T[K]) => void;
  reset: () => void;
} {
  const [searchParams, setSearchParams] = useSearchParams()
  let components: Record<string, unknown> = {}
  try {
    const parsed: unknown = JSON.parse(searchParams.get('config') ?? '{}')
    if (isPlainObject(parsed)) components = parsed as Record<string, unknown>
  } catch {
    // A malformed query should still open the example.
  }

  const input = isPlainObject(components[component]) ? components[component] as Record<string, unknown> : {}
  const overrides = Object.fromEntries(Object.entries(input)
    .filter(([key]) => !COMPONENT_CONFIG_RESERVED_KEYS.includes(key) && !/^on[A-Z]/.test(key)))
  const config = { ...props, ...Object.fromEntries(Object.entries(overrides).map(([key, value]) => [key, value === null ? undefined : value])) } as T

  const write = (update: (values: Record<string, unknown>) => Record<string, unknown>): void => {
    updateExampleSearchParams(setSearchParams, params => {
      let next: Record<string, unknown> = {}
      try {
        const parsed: unknown = JSON.parse(params.get('config') ?? '{}')
        if (isPlainObject(parsed)) next = parsed as Record<string, unknown>
      } catch {
      // A control edit replaces malformed config with valid state.
      }
      const values = update(isPlainObject(next[component]) ? next[component] as Record<string, unknown> : {})
      if (Object.keys(values).length) next[component] = values
      else delete next[component]
      if (Object.keys(next).length) params.set('config', JSON.stringify(next))
      else params.delete('config')
    })
  }

  const setConfig = <K extends keyof T>(key: K, value: T[K]): void => {
    write(values => {
      const next = { ...values }
      if (value === props[key]) delete next[String(key)]
      else next[String(key)] = value ?? null
      return next
    })
  }

  return { config, setConfig, reset: () => write(() => ({})) }
}
