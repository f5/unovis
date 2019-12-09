// Copyright (c) Volterra, Inc. All rights reserved.
import _isFunction from 'lodash/isFunction'

export function getValue (d, accessor): number {
  if (_isFunction(accessor)) return accessor(d)
  else return accessor
}
