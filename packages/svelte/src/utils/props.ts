import { isEqual } from '@unovis/ts'

export function arePropsEqual<PropTypes> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  return isEqual(prevProps, nextProps)
}
