import { isEqual } from '@unovis/ts'

export const arePropsEqual = <PropTypes>(
  prevProps: PropTypes,
  nextProps: PropTypes
): boolean => {
  return isEqual(prevProps, nextProps, [], new Set(), true)
}
