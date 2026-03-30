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

export enum DonutSegmentLabelPosition {
  Inside = 'inside',
  Outside = 'outside',
}
