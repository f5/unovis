import { GenericDataRecord } from '../types/data'

export type MapLink<PointDatum, LinkDatum> = LinkDatum & {
  source: PointDatum;
  target: PointDatum;
}

type MapPoint = GenericDataRecord & { id: string; latitude: number; longitude: number }
type MapArea = { id: string } & GenericDataRecord

export type MapData = {
  points?: MapPoint[];
  links?: MapLink<(number | string | MapPoint), any>[];
  areas?: MapArea[];
}

