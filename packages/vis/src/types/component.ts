// Copyright (c) Volterra, Inc. All rights reserved.
export enum ComponentType {
  SVG,
  HTML,
}

export enum Sizing {
  FIT = 'fit',
  EXTEND = 'extend',
}

export interface ExtendedSizeComponent {
  getWidth?(): number;
  getHeight?(): number;
}
