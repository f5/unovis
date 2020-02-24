// Copyright (c) Volterra, Inc. All rights reserved.

export enum LeafletMapRenderer {
  TANGRAM = 'tangram',
  MAPBOXGL = 'mapboxgl',
}

export enum PointShape {
  SQUARE = 'square',
  CIRCLE = 'circle',
  HEXAGON = 'hexagon',
  TRIANGLE = 'triangle',
  CLUSTER = 'cluster',
}

export enum ClusterOutlineType {
  LINE = 'line',
  DONUT = 'donut',
}

export interface StatusStyle {
  color?: string;
  className?: string;
}

export type StatusMap = { [key: string]: StatusStyle }

export type Point = {
  geometry: GeoJSON.Geometry;
  bbox: {};
  radius: number;
  path: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  index: any;
  id: number | string;
  properties: {
    cluster: any;
    status: string;
    shape: PointShape;
    id: string | number;
    // eslint-disable-next-line camelcase
    point_count: number;
    // eslint-disable-next-line camelcase
    cluster_id: string | number;
    sum: {
      [key: string]: number;
    };
    expandedClusterPoint?: Point;
  };
  _sortId: number;
}

export type PieDatum = {
  value: number;
  status: string;
}

export type Bounds = {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}
