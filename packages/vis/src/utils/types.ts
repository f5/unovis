// Copyright (c) Volterra, Inc. All rights reserved.
import { Scale } from 'enums/scales'

// Enums
import { TrimType, VerticalAlign, FitMode } from 'enums/text'

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
  trimType?: TrimType;
  verticalAlign?: VerticalAlign;
  wordBreak?: boolean;
  trimOnly?: boolean;
  forceWrap?: boolean;
  dy?: number;
  fitMode?: FitMode;
}
