// Copyright (c) Volterra, Inc. All rights reserved.
import { ScaleType } from 'types/scales'

export type NumericAccessor<Datum> = ((d: Datum, i?: number, ...any) => number | null) | number | null
export type StringAccessor<Datum> = ((d: Datum, i?: number, ...any) => string) | string
export type ColorAccessor<Datum> = ((d: Datum, i?: number, ...any) => string) | string
export type BooleanAccessor<Datum> = ((d: Datum, i?: number, ...any) => boolean) | boolean

export type Dimension = {
  /** D3 scale, e.g. Scale.ScaleLinear */
  scale?: ScaleType;
  /** Force set scale domain (data extent) */
  domain?: [number | undefined, number | undefined];
  /** Constraint the minimum value of the scale domain */
  domainMinConstraint?: [number, number];
  /** Constraint the maximum value of the scale domain */
  domainMaxConstraint?: [number, number];
  /** Force set the domain range (screen space) */
  range?: [number, number];
}

export type Spacing = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}
