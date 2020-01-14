// Copyright (c) Volterra, Inc. All rights reserved.
import { ScaleType } from 'types/scales'

export type NumericAccessor = ((d: any, i?: number, ...any) => number) | number

export type Dimension = {
  scale?: ScaleType;
  domain?: number[];
  range?: number[];
}

export type Margin = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}
