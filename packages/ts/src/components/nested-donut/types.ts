import { HierarchyRectangularNode } from 'd3-hierarchy'

export type NestedDonutSegmentDatum<Datum> = {
  key: string;
  root: string;
  values?: Datum[];
}

export type NestedDonutSegment<Datum> = HierarchyRectangularNode<NestedDonutSegmentDatum<Datum>> & {
  _id: string;
  _layer: NestedDonutLayer;
  _index?: number;
  _state?: {
    fill?: string;
  };
}

export enum NestedDonutDirection {
  Inwards = 'inwards',
  Outwards = 'outwards',
}

export type NestedDonutLayerSettings = {
  rotateLabels?: boolean;
  width?: number;
}

export type NestedDonutLayer = NestedDonutLayerSettings & {
  _id: number;
  _innerRadius: number;
  _outerRadius: number;
}

export const defaultLayerSettings: NestedDonutLayerSettings = {
  rotateLabels: false,
  width: 50,
}

