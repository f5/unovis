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
      preservedProps[camelize(key) as keyof T] = props[camelize(key)]
    })
    return { ...preservedProps, ...attrs }
  })
}

