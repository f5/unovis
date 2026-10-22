import { PieArcDatum } from 'd3-shape'

export type DonutDatum<Datum> = {
  datum: Datum;
  /** Original datum index as in unfiltered data */
  index: number;
}

/** Data type for Donut Arc Generator */
export interface DonutArcDatum<Datum> extends PieArcDatum<Datum> {
  /** Original datum index as in unfiltered data */
  index: number;
  innerRadius: number;
  outerRadius: number;
}

export type DonutArcAnimState = { startAngle: number; endAngle: number; innerRadius: number; outerRadius: number; padAngle?: number }

/** Data type for the icons displayed in the middle of the segments */
export interface DonutIconDatum<Datum> {
  data: Datum;
  /** Original datum index as in unfiltered data */
  index: number;
  icon: string;
  iconSize: number;
  /** Angle of the segment's bisector */
  angle: number;
  /** Distance from the center of the donut to the center of the icon */
  radius: number;
  /** `false` when the segment is too small to fit the icon */
  visible: boolean;
}
