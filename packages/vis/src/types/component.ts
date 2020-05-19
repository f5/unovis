// Copyright (c) Volterra, Inc. All rights reserved.
export enum ComponentType {
  SVG,
  HTML,
}

export enum Sizing {
  FIT = 'fit',
  CONTAIN = 'contain',
}

export interface CustomSizedComponent {
  customWidth?: number;
  customHeight?: number;
}
