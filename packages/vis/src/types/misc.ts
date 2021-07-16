// Copyright (c) Volterra, Inc. All rights reserved.
import { ContinuousScale } from 'types/scale'

export type NumericAccessor<Datum> = ((d: Datum, i?: number, ...any) => number | null) | number | null | undefined
export type StringAccessor<Datum> = ((d: Datum, i?: number, ...any) => string | null) | string | null
export type ColorAccessor<Datum> = ((d: Datum, i?: number, ...any) => string | null) | string | null
export type BooleanAccessor<Datum> = ((d: Datum, i?: number, ...any) => boolean | null) | boolean | null
export type GenericAccessor<T, Datum> = ((d: Datum, i?: number, ...any) => T | null) | T | null

export type Dimension = {
  /** D3 scale, e.g. Scale.ScaleLinear */
  scale?: ContinuousScale;
  /** Force set scale domain (data extent) */
  domain?: [number | undefined, number | undefined];
  /** Constraint the minimum value of the scale domain */
  domainMinConstraint?: [number | undefined, number | undefined];
  /** Constraint the maximum value of the scale domain */
  domainMaxConstraint?: [number | undefined, number | undefined];
  /** Force set the domain range (screen space) */
  range?: [number, number];
}

export type Spacing = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
}
