// Copyright (c) Volterra, Inc. All rights reserved.
export type NumericAccessor = ((d: any, i?: number, ...any) => number) | number

export type Dimension = {
  scale?: any;
  domain?: number[];
  range?: number[];
}
