export enum ComponentType {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SVG,
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
