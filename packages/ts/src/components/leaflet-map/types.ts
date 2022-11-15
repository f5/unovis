import { LatLng } from 'leaflet'
import Supercluster, { ClusterProperties } from 'supercluster'

export enum LeafletMapRenderer {
  Raster = 'raster',
  MapLibre = 'maplibre',
}

export enum LeafletMapPointShape {
  Square = 'square',
  Circle = 'circle',
  Triangle = 'triangle',
  Ring = 'ring',
}

export type LeafletMapPieDatum = {
  value: number;
  name: string;
  color: string;
  className?: string;
}

export interface LeafletMapPointStyle {
  color: string;
  className?: string;
}

export type LeafletMapPointStyles<D> = { [key in keyof D]?: LeafletMapPointStyle }

export type PointExpandedClusterProperties<D> = {
  // Expanded cluster related data:
  // eslint-disable-next-line no-use-before-define
  expandedClusterPoint?: LeafletMapPoint<D>;
  r?: number;
  dx?: number;
  dy?: number;
}

export type LeafletMapClusterDatum<D> = Partial<D> & ClusterProperties & {
  clusterIndex?: Supercluster<D>;
  clusterPoints?: D[];
}

export type LeafletMapPointDatum<D> = D & PointExpandedClusterProperties<D> & {
  id: string | number;
  shape: LeafletMapPointShape;
};

export type LeafletMapPoint<D> = {
  geometry: GeoJSON.Point;
  bbox: { x1: number; x2: number; y1: number; y2: number };
  radius: number;
  path: string;
  color: string;
  id: number | string;
  properties: LeafletMapPointDatum<D> | LeafletMapClusterDatum<D>;
  donutData: LeafletMapPieDatum[];
  isCluster: boolean;
  clusterIndex: Supercluster<D, Supercluster.AnyProps>;
  clusterPoints?: D[];
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
