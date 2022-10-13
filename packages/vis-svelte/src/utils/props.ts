import _isEqual from 'lodash/isEqual.js'

export function arePropsEqual<PropTypes> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  return _isEqual(prevProps, nextProps)
}
