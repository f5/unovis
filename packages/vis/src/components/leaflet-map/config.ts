// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */

// Core
import { ComponentConfig, ComponentConfigInterface } from 'core/component/config'
import { Tooltip } from 'core/tooltip'

// Types
import { NumericAccessor, StringAccessor, ColorAccessor } from 'types/misc'
import { LeafletMapRenderer, Bounds, ValuesMap, MapZoomState, PointDatum } from 'types/map'
import { LeafletMap } from './index'

export interface LeafletMapConfigInterface<Datum> extends ComponentConfigInterface {
  // General
  /** FlyTo Duration */
  flyToDuration?: number;
  /** Zoom Duration */
  zoomDuration?: number;
  /** Default bounds that will be applid on the first map render if the bounds property is not set */
  initialBounds?: Bounds;
  /** Force set map bounds */
  bounds?: Bounds;
  /** */
  renderer?: LeafletMapRenderer | string;
  /**  */
  tangramRenderer?: any;
  /** Mapboxgl Access Token or Nextzen API key */
  accessToken?: string;
  /** Mapbox style glyphs URL */
  mapboxglGlyphs?: string;
  /** Tangram or Mapbox sources settings */
  sources?: Record<string, unknown>;
  /** Tangram or Mapbox style renderer settings */
  rendererSettings?: Record<string, unknown>;
  /** Array of attribution labels */
  attribution?: string[];

  // Map events
  /** Function to be called after Map async initialization is done. Default: `undefined` */
  onMapInitialized?: (() => any);
  /** Map Move / Zoom joint callback function. Default: `undefined` */
  onMapMoveZoom?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any);
  /** Move Move Start callback function. Default: `undefined` */
  onMapMoveStart?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any);
  /** Move Move End callback function. Default: `undefined` */
  onMapMoveEnd?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any);
  /** Move Zoom Start callback function. Default: `undefined` */
  onMapZoomStart?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any);
  /** Move Zoom End callback function. Default: `undefined` */
  onMapZoomEnd?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any);
  /** Move Zoom End callback function. Default: `undefined` */
  onMapClick?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any);

  // Point
  /** Point longitude accessor function or value */
  pointLongitude?: NumericAccessor<Datum>;
  /** Point latitude accessor function or value */
  pointLatitude?: NumericAccessor<Datum>;
  /** Point id accessor function or value */
  pointId?: StringAccessor<Datum>;
  /** Point shape accessor function or value */
  pointShape?: StringAccessor<Datum>;
  /** Point color accessor function or value */
  pointColor?: ColorAccessor<Datum>;
  /** Point radius accessor function or value */
  pointRadius?: NumericAccessor<PointDatum<Datum>>;
  /** Point inner label accessor function */
  pointLabel?: StringAccessor<PointDatum<Datum>>;
  /** Point bottom label accessor function */
  pointBottomLabel?: StringAccessor<PointDatum<Datum>>;
  /** Point cursor value or accessor function, Default: `null` */
  pointCursor?: StringAccessor<PointDatum<Datum>>;
  /** */
  selectedNodeId?: string;

  // Cluster
  /** Cluster point outline width */
  clusterOutlineWidth?: number;
  /** Use cluster background */
  clusterBackground?: boolean;
  /** Defines whether the cluster should expand on click or not. Default: `false` */
  clusterExpandOnClick?: boolean;
  /** Clustering radius. Default: `45` */
  clusterRadius?: number;
  /** Status styles */
  valuesMap?: ValuesMap;

  // TopoJSON overlay
  /** A TopoJSON Geometry layer to be displayed on top of the map. Supports fill and stroke */
  topoJSONLayer?: {
    /** TopoJSON.Topology */
    sources?: any;
    featureName?: string;
    fillProperty?: string;
    strokeProperty?: string;
    fillOpacity?: number;
    strokeOpacity?: number;
    strokeWidth?: number;
  };

  // Misc
  /** Tooltip component */
  tooltip?: Tooltip<LeafletMap<Datum>, Datum>;
}

export class LeafletMapConfig<Datum> extends ComponentConfig implements LeafletMapConfigInterface<Datum> {
  // General
  flyToDuration = 1500
  zoomDuration = 800
  initialBounds = undefined
  bounds = undefined
  renderer = LeafletMapRenderer.TANGRAM
  attribution = []
  accessToken = ''

  // Map events
  onMapInitialized = undefined
  onMapMoveZoom = undefined
  onMapMoveStart = undefined
  onMapMoveEnd = undefined
  onMapZoomStart = undefined
  onMapZoomEnd = undefined
  onMapClick = undefined

  // Point
  pointLongitude = (d: Datum): number => d['longitude']
  pointLatitude = (d: Datum): number => d['latitude']
  pointId = (d: Datum): string => d['id']
  pointShape = (d: Datum): string => d['shape']
  pointColor = (d: Datum): string => d['color']
  pointRadius = undefined
  pointLabel = (d: PointDatum<Datum>): string => `${d.point_count ?? ''}`
  pointBottomLabel = (d: PointDatum<Datum>): string => ''
  pointCursor = null
  selectedNodeId = undefined

  // Cluster
  clusterOutlineWidth = 1.25
  clusterBackground = true
  clusterExpandOnClick = true;
  clusterRadius = 55
  valuesMap = {}

  // TopoJSON Overlay
  topoJSONLayer = {
    sources: undefined,
    fillOpacity: 0.6,
    strokeOpacity: 0.8,
    strokeWidth: 1,
    featureName: undefined,
    fillProperty: undefined,
    strokeProperty: undefined,
  }

  // Misc
  tooltip = undefined
}
