import { isEqual } from '@unovis/ts'
import { ComponentInternalInstance, camelize, computed, getCurrentInstance } from 'vue'

export function arePropsEqual<PropTypes> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  return isEqual(prevProps, nextProps, [], new Set(), true)
}

// source: https://www.radix-vue.com/utilities/use-forward-props.html
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export function useForwardProps<T extends Record<string, any>> (props: T) {
  const vm = getCurrentInstance()
  const attrs = vm.attrs

  return computed(() => {
    const preservedProps = {} as T
    const assignedProps = vm?.vnode.props ?? {}

    Object.keys(assignedProps).forEach((key) => {
      preservedProps[camelize(key) as keyof T] = props[camelize(key)]
    })
    return { ...preservedProps, ...attrs }
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export function parseProps <T extends object> (props: T, instance: ComponentInternalInstance | null) {
  const preservedProps = {} as T
  const assignedProps = instance?.vnode.props ?? {}

  Object.keys(assignedProps).forEach(key => {
    preservedProps[camelize(key)] = assignedProps[key]
  })
  return preservedProps
}

