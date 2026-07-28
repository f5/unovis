export type RadialBarDatum<Datum> = {
  datum: Datum;
  /** Original datum index as in unfiltered data */
  index: number;
}

/** Data type for the Radial Bar Arc Generator */
export interface RadialBarArcDatum<Datum> {
  data: Datum;
  /** Original datum index as in unfiltered data */
  index: number;
  /** Index of the ring counted from the outermost (`0` = outermost). */
  ringIndex: number;
  /** Resolved value. `null` when the `value` accessor returned `null`, `undefined` or a non-finite number */
  value: number | null;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  padAngle: number;
}

export type RadialBarArcAnimState = { startAngle: number; endAngle: number; innerRadius: number; outerRadius: number; padAngle?: number }
