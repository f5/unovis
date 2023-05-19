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

export enum NestedDonutSegmentLabelAlignment {
  Along = 'along',
  Perpendicular = 'perpendicular',
  Straight = 'straight',
}

export type NestedDonutLayerSettings = {
  labelAlignment?: NestedDonutSegmentLabelAlignment;
  width?: number;
}

export type NestedDonutLayer = NestedDonutLayerSettings & {
  _id: number;
  _innerRadius: number;
  _outerRadius: number;
}

export const defaultLayerSettings: NestedDonutLayerSettings = {
  labelAlignment: NestedDonutSegmentLabelAlignment.Perpendicular,
  width: 50,
}

