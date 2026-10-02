export type CircularBarDatum<Datum> = {
  datum: Datum;
  /** Original datum index as in unfiltered data */
  index: number;
}

/** Data type for the Circular Bar Path Generator */
export interface CircularBarArcDatum<Datum> {
  data: Datum;
  /** Original datum index as in unfiltered data */
  index: number;
  /** Resolved value. `null` when the `value` accessor returned `null`, `undefined` or a non-finite number */
  value: number | null;
  startAngle: number;
  endAngle: number;
  /** Inner radius of the chart (see the `innerRadius` config property) */
  innerRadius: number;
  /** Outer radius of the bar, i.e. how far from the center the bar reaches */
  outerRadius: number;
  /** Radius at which the bar starts: its rounded tip or its inner edge. Bars grow from it when they enter */
  baseRadius: number;
}

export type CircularBarArcAnimState = { startAngle: number; endAngle: number; innerRadius: number; outerRadius: number }

/** Effective bar geometry after the corner radii were reduced to fit the bar */
export type CircularBarPetalGeometry = {
  cornerRadius: number;
  innerCornerRadius: number;
  /** Radius at which the bar starts: its rounded tip or its inner edge */
  baseRadius: number;
  /** `true` when the inner corners merge into a single rounded tip */
  hasTip: boolean;
  /** `true` when the bar is too short for the straight sides of the tip shape, and the outer arc cuts the tip circle directly */
  isClipped: boolean;
}

/** Data type for the icons displayed at the inner end of the bars */
export interface CircularBarIconDatum<Datum> {
  data: Datum;
  /** Original datum index as in unfiltered data */
  index: number;
  icon: string;
  iconSize: number;
  /** Angle of the bar's bisector */
  angle: number;
  /** Distance from the center of the chart to the center of the icon */
  radius: number;
  /** `false` when the bar is too short to fit the icon, or its value is missing */
  visible: boolean;
}

export type CircularBarIconAnimState = { angle: number; radius: number }
