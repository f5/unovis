// Copyright (c) Volterra, Inc. All rights reserved.
import { ScaleType } from 'types/scales'

export type NumericAccessor<Datum> = ((d: Datum, i?: number, ...any) => number) | number
export type StringAccessor<Datum> = ((d: Datum, i?: number, ...any) => string) | string
export type ColorAccessor<Datum> = ((d: Datum, i?: number, ...any) => string) | string

export type Dimension = {
  scale?: ScaleType;
  domain?: number[];
  range?: number[];
}

export type Spacing = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}
