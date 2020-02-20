// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { LatLng } from 'leaflet'
// Core
import { Config } from 'core/config'

// Types
import { NumericAccessor, StringAccessor, ColorAccessor } from 'types/misc'
import { LeafletMapRenderer, ClusterOutlineType, Bounds, StatusMap } from 'types/map'

export interface LeafletMapConfigInterface<T> {
  renderer?: LeafletMapRenderer | string;
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
  onMapMoveZoom?: (({ mapCenter, zoomLevel, bounds }: { mapCenter: LatLng; zoomLevel: number; bounds: Bounds }) => any);
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
  /** Default bounds that will be applid on the first map render if the bounds property is not set */
  initialBounds?: Bounds;
  /** Force set map bounds */
  bound?: Bounds;
  /** Status styles */
  statusMap?: StatusMap;
  /** If selectedNodeId is provided the map will zoom in and select that node on update */
  selectedNodeId?: string;
}

export class LeafletMapConfig<T> extends Config implements LeafletMapConfigInterface<T> {
  renderer = LeafletMapRenderer.TANGRAM
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
  initialBounds = undefined
  bounds = undefined
  statusMap = {}
  selectedNodeId = undefined
}
