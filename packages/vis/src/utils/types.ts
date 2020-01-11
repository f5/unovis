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
  readonly length?: number;
  readonly width?: number;
  readonly separator?: string | string[];
  readonly trimType?: TrimType;
  readonly verticalAlign?: VerticalAlign;
  readonly wordBreak?: boolean;
  readonly trimOnly?: boolean;
  readonly forceWrap?: boolean;
  readonly dy?: number;
  readonly fitMode?: FitMode;
}
