// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { LatLng } from 'leaflet'
// Core
import { Config } from 'core/config'

// Types
import { NumericAccessor, StringAccessor, ColorAccessor } from 'types/misc'
import { MapRenderer, ClusterOutlineType, Bounds, StatusMap } from 'types/map'

export interface MapConfigInterface<T> {
  renderer?: MapRenderer;
  /**  */
  tamgramRenderer?: any;
  /** Mapboxgl Access Token or Nextzen API key */
  accessToken?: string;
  /** Mapbox style glyphs URL */
  mapboxglGlyphs?: string;
  /** Tangram or Mapbox sources settings */
  sources?: {};
  /** Tangram or Mapbox style renderer settings */
  rendererSettings?: {};
  /** Function */
  onMapMoveZoom?: (({ mapCenter, zoomLevel }: { mapCenter: LatLng; zoomLevel: number }) => any);
  /** Point longitude accessor function or value */
  pointLongitude?: NumericAccessor<T>;
  /** Point latitude accessor function or value */
  pointLatitude?: NumericAccessor<T>;
  /** Point id accessor function or value */
  pointId?: StringAccessor<T>;
  /** Point status accessor function or value */
  pointStatus?: StringAccessor<T>;
  /** Point shape accessor function or value */
  pointShape?: StringAccessor<T>;
  /** Point color accessor function or value */
  pointColor?: ColorAccessor<T>;
  /** Point radius accessor function or value */
  pointRadius?: NumericAccessor<T>;
  /** Point stroke width accessor function or value */
  pointStrokeWidth?: NumericAccessor<T>;
  /** Cluster point outline type */
  clusterOutlineType?: ClusterOutlineType;
  /** Cluster point outline width */
  clusterOutlineWidth?: number;
  /** Use cluster background */
  clusterBackground?: boolean;
  /** FlyTo Duration */
  flyToDuration?: number;
  /** Default bounds */
  bounds?: Bounds;
  /** Status styles */
  statusMap?: StatusMap;
}

export class MapConfig<T> extends Config implements MapConfigInterface<T> {
  renderer = MapRenderer.TANGRAM
  accessToken = ''
  onMapMoveZoom = undefined
  pointLongitude = (d: T): number => d['longitude']
  pointLatitude = (d: T): number => d['latitude']
  pointId = (d: T): string => d['id']
  pointStatus = (d: T): string => d['status']
  pointShape = (d: T): string => d['shape']
  pointColor = (d: T): string => d['color']
  pointRadius = undefined
  pointStrokeWidth = 1
  clusterOutlineType = ClusterOutlineType.DONUT
  clusterOutlineWidth = 1.25
  clusterBackground = true
  flyToDuration = 2000
  bounds = { northEast: { lat: 77, lng: -172 }, southWest: { lat: -50, lng: 172 } }
  statusMap = {}
}
