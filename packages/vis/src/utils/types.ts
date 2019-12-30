// Copyright (c) Volterra, Inc. All rights reserved.
import { Scale } from 'enums/scales'

export type NumericAccessor = ((d: any, i?: number, ...any) => number) | number

export type Dimension = {
  scale?: Scale;
  domain?: number[];
  range?: number[];
}

export type Margin = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export type WrapTextOptions = {
  length?: number;
  width?: number;
  separator?: string | string[];
  trimType?: string;
  verticalAlign?: string;
  wordBreak?: boolean;
  trimOnly?: boolean;
  dy?: number
}
