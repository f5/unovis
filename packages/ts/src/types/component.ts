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
  getWidth(): number;
  getHeight(): number;
}

/** Checks whether a component reports its own size and can be used
 * with the `Sizing.Extend` and `Sizing.FitWidth` sizing modes */
export function isExtendedSizeComponent (component: unknown): component is ExtendedSizeComponent {
  const c = component as ExtendedSizeComponent
  return typeof c?.getWidth === 'function' && typeof c?.getHeight === 'function'
}
