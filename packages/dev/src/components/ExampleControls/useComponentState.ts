import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'
import { isFunction } from '@unovis/ts'

import { useComponentConfig } from './useComponentConfig'

export function useComponentState<T> (component: string, key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [defaultValue] = useState<T>(initial)
  const { config, setConfig } = useComponentConfig(component, { [key]: defaultValue })
  const current = useRef({ value: config[key], setConfig })
  current.current = { value: config[key], setConfig }
  const setValue = useCallback((update: SetStateAction<T>): void => {
    const value = isFunction(update) ? (update as (previous: T) => T)(current.current.value) : update
    current.current.value = value
    current.current.setConfig(key, value)
  }, [key])
  return [config[key], setValue]
}
