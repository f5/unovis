import { isEqual } from '@unovis/ts'
import { camelize, computed, getCurrentInstance, useAttrs } from 'vue'

export function arePropsEqual<PropTypes> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  return isEqual(prevProps, nextProps)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export function useForwardProps<T extends Record<string, any>> (props: T) {
  const vm = getCurrentInstance()
  const attrs = useAttrs()

  return computed(() => {
    const preservedProps = {} as T
    const assignedProps = vm?.vnode.props ?? {}

    Object.keys(assignedProps).forEach((key) => {
      const camelKey = camelize(key) as keyof T
      // `data` is not a config property (it's passed separately via `setData`), so we don't
      // forward it: the config merge would deep-clone the whole dataset on every update
      if (camelKey === 'data') return
      preservedProps[camelKey] = props[camelKey as string]
    })
    return { ...preservedProps, ...attrs }
  })
}

