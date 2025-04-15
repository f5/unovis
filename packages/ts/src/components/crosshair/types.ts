import { NumericAccessor } from '@/types/accessor'

export type CrosshairCircle = {
  y: number;
  color: string;
  opacity?: number;
  id?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export type CrosshairAccessors<Datum> = {
  x: NumericAccessor<Datum> | undefined;
  y: NumericAccessor<Datum>[] | undefined;
  yStacked: NumericAccessor<Datum>[] | undefined;
  baseline: NumericAccessor<Datum> | undefined;
}
