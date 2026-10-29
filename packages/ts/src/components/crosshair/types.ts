import { NumericAccessor } from '@/types/accessor'

export type CrosshairCircle = {
  y: number;
  color: string;
  opacity?: number;
  id?: string;
  strokeColor?: string;
  strokeWidth?: number;
  /** Size of the segment the circle belongs to. Among overlapping circles, the largest one is painted last */
  magnitude?: number;
}

export type CrosshairAccessors<Datum> = {
  x: NumericAccessor<Datum> | undefined;
  y: NumericAccessor<Datum>[] | undefined;
  yStacked: NumericAccessor<Datum>[] | undefined;
  baseline: NumericAccessor<Datum> | undefined;
}

export type CrosshairSeries = {
  /** Id of the series' Crosshair circle */
  id: string;
  /** Index of the series in the order of the Crosshair circles (stacked first) */
  index: number;
  /** Value of the series at the datum */
  value: number;
  /** Vertical position of the series' Crosshair circle in pixels */
  y: number;
}

/** Tick formats of the X and Y axes */
export type CrosshairTickFormats = {
  x?: (tick: number | Date, i: number, ticks: number[] | Date[]) => string;
  y?: (tick: number | Date, i: number, ticks: number[] | Date[]) => string;
}
