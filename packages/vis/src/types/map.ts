// Copyright (c) Volterra, Inc. All rights reserved.

export enum MapRenderer {
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
  fill?: string;
  stroke?: string;
}

export type Point = {
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
    id: string | number;
    point_count: number;
    cluster_id: string | number;
    sum: {
      [key: string]: number;
    };
  };
  cluster: any;
  _sortId: number;
}

export type pieDataValue = {
  value: number;
  status: string;
}

export type Bounds = {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}
