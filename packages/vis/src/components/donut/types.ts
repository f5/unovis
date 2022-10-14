import { PieArcDatum } from 'd3-shape'

/** Data type for Donut Arc Generator */
export interface DonutArcDatum<Datum> extends PieArcDatum<Datum> {
  index: number;
  innerRadius: number;
  outerRadius: number;
}

export type DonutArcAnimState = { startAngle: number; endAngle: number; innerRadius: number; outerRadius: number }
