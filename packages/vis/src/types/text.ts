// Copyright (c) Volterra, Inc. All rights reserved.

export enum TrimMode {
  Start = 'start',
  Middle = 'middle',
  End = 'end',
}

export enum VerticalAlign {
  Top = 'top',
  Middle = 'middle',
  Bottom = 'bottom',
}

export enum FitMode {
  Wrap = 'wrap',
  Trim = 'trim',
}

export enum WrapMode {
  FontSize = 'fontsize',
  DOM = 'dom',
}

export enum TextAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
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
  readonly wrapMode?: WrapMode;
  readonly maxStrLen?: number;
  readonly fontSize?: number;
  readonly widthToHeightRatio?: number;
}
