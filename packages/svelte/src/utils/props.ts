import { isEqual } from '@unovis/ts/utils/data'

export function arePropsEqual<PropTypes> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  return isEqual(prevProps, nextProps)
}
