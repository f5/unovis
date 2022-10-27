import _isEqual from 'lodash-es/isEqual.js'

export function arePropsEqual<PropTypes> (prevProps: PropTypes, nextProps: PropTypes): boolean {
  return _isEqual(prevProps, nextProps)
}
