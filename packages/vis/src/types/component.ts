export enum ComponentType {
  SVG,
  HTML,
}

export enum Sizing {
  Fit = 'fit',
  Extend = 'extend',
  FitWidth = 'fit_width',
}

export interface ExtendedSizeComponent {
  getWidth?(): number;
  getHeight?(): number;
}
