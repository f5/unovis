// Copyright (c) Volterra, Inc. All rights reserved.
import { LatLng } from 'leaflet'
import Supercluster from 'supercluster'

export enum LeafletMapRenderer {
  Tangram = 'tangram',
  MapboxGL = 'mapboxgl',
}

export enum PointShape {
  Square = 'square',
  Circle = 'circle',
  Hexagon = 'hexagon',
  Triangle = 'triangle',
  Cluster = 'cluster',
}

export type PieDatum = {
  value: number;
  name: string;
  color: string;
  className?: string;
}

export interface ValuesMapItem {
  color: string;
  className?: string;
}

export type ValuesMap = { [key: string]: ValuesMapItem }

export type PointExpandedClusterProperties<D> = {
  // Expanded cluster related data:
  // eslint-disable-next-line no-use-before-define
  expandedClusterPoint?: Point<D>;
  r?: number;
  dx?: number;
  dy?: number;
}

export type PointDatum<D> = D & PointExpandedClusterProperties<D> & {
  id: string | number;
  clusterIndex?: Supercluster<D>;
  shape: PointShape;

  // Supercluster generated data:
  cluster: boolean;
  // eslint-disable-next-line camelcase,@typescript-eslint/naming-convention
  point_count: number;
  // eslint-disable-next-line camelcase,@typescript-eslint/naming-convention
  cluster_id: string | number;
};

export type Point<D> = {
  geometry: GeoJSON.Geometry;
  bbox: { x1: number; x2: number; y1: number; y2: number };
  radius: number;
  path: string;
  fill: string;
  index: any;
  id: number | string;
  properties: PointDatum<D>;
  donutData: PieDatum[];
  _zIndex: number;
}

export type Bounds = {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}

export type MapZoomState = {
  mapCenter: LatLng;
  zoomLevel: number;
  bounds: Bounds;
  userDriven: boolean;
}
