// Copyright (c) Volterra, Inc. All rights reserved.
export enum ComponentType {
  SVG,
  HTML,
}

export enum Sizing {
  FIT = 'fit',
  EXTEND = 'extend',
  FIT_WIDTH = 'fit_width',
}

export interface ExtendedSizeComponent {
  getWidth?(): number;
  getHeight?(): number;
}
