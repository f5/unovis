// Copyright (c) Volterra, Inc. All rights reserved.
import _isUndefined from 'lodash/isUndefined'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'
import _isNil from 'lodash/isNil'
import _cloneDeep from 'lodash/cloneDeep'
import _throttle from 'lodash/throttle'
import _each from 'lodash/each'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _without from 'lodash/without'
import _find from 'lodash/find'
import _findIndex from 'lodash/findIndex'
import _isString from 'lodash/isString'
import _isObject from 'lodash/isObject'
import _isFunction from 'lodash/isFunction'
import _isNumber from 'lodash/isNumber'
import _merge from 'lodash/merge'
import _isPlainObject from 'lodash/isPlainObject'
import _flatten from 'lodash/flatten'
import _omit from 'lodash/omit'
import _extend from 'lodash/extend'
// If you add a new lodash import here, please specify it in rollup.config.js as well

export const isNumber = _isNumber
export const isEqual = _isEqual
export const isFunction = _isFunction
export const merge = _merge
export const isPlainObject = _isPlainObject
export const isUndefined = _isUndefined
export const isArray = _isArray
export const isEmpty = _isEmpty
export const isNil = _isNil
export const cloneDeep = _cloneDeep
export const each = _each
export const filter = _filter
export const get = _get
export const without = _without
export const find = _find
export const findIndex = _findIndex
export const isString = _isString
export const isObject = _isObject
export const throttle = _throttle
export const flatten = _flatten
export const omit = _omit
export const extend = _extend

export function getValue (d, accessor, index?: number): any {
  if (isFunction(accessor)) return accessor(d, index)
  else return accessor
}

export function clean (data: any[]): any[] {
  return data.filter(d => d && !isNumber(d))
}

export function clamp (d: number, min: number, max: number): number {
  return Math.min(Math.max(d, min), max)
};

export function countUnique (array, accessor = d => d): number {
  return new Set(array.map(d => accessor(d))).size
}

export function indexArray (n: number): number[] {
  return [...Array(n).keys()]
}
