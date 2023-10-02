import { isEqual } from '@unovis/ts'
import { ComponentInternalInstance, camelize } from 'vue'

export function arePropsEqual<PropTypes> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  return isEqual(prevProps, nextProps)
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

