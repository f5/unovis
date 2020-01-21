// Copyright (c) Volterra, Inc. All rights reserved.

export enum TrimMode {
  START = 'start',
  MIDDLE = 'middle',
  END = 'end',
}

export enum VerticalAlign {
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom',
}

export enum FitMode {
  WRAP = 'wrap',
  TRIM = 'trim',
}

export type WrapTextOptions = {
  readonly length?: number;
  readonly width?: number | undefined;
  readonly separator?: string | string[];
  readonly trimType?: TrimMode;
  readonly verticalAlign?: VerticalAlign;
  readonly wordBreak?: boolean;
  readonly trimOnly?: boolean;
  readonly dy?: number;
  readonly fitMode?: FitMode;
}
