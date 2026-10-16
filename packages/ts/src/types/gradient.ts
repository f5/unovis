export enum GradientType {
  Linear = 'linear',
  Radial = 'radial',
}

/** Direction of a linear gradient: the first stop is placed at the start, the last one at the end */
export enum GradientDirection {
  TopToBottom = 'top-to-bottom',
  BottomToTop = 'bottom-to-top',
  LeftToRight = 'left-to-right',
  RightToLeft = 'right-to-left',
}

/** Coordinate system of the gradient, see SVG's `gradientUnits` */
export enum GradientUnits {
  /** The gradient spans the bounding box of every painted element (each bar, segment or tile) */
  ObjectBoundingBox = 'objectBoundingBox',
  /** The gradient spans the area provided by the component (e.g. the whole plot or the donut), shared by all elements */
  UserSpaceOnUse = 'userSpaceOnUse',
}

export type GradientStop = {
  /** Position of the stop along the gradient vector (linear) or radius (radial), from `0` to `1` */
  offset: number;
  /** Stop opacity. Default: `1` */
  opacity?: number;
  /** Stop color. Default: the element's color */
  color?: string;
  /** Mixes the stop color with white (positive values) or black (negative values), from `-1` to `1`. Default: `0` */
  colorShift?: number;
}

export type Gradient = {
  /** Gradient type. Default: `GradientType.Linear`, or `GradientType.Radial` for the radial components */
  type?: GradientType;
  /** Linear gradient direction. The default depends on the component and its orientation */
  direction?: GradientDirection;
  /** Gradient units. The default depends on the component */
  units?: GradientUnits;
  /** Gradient stops. Default: from opacity `1` to `0.4` */
  stops?: GradientStop[];
}

/** Rectangle in the painted element's user space, used for `GradientUnits.UserSpaceOnUse` */
export type GradientSpace = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Radial gradients only: radius at which the first stop is placed (e.g. the inner radius of a donut) */
  innerRadius?: number;
}
