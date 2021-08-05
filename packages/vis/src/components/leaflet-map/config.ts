// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */

// Core
import { ComponentConfig, ComponentConfigInterface } from 'core/component/config'
import { Tooltip } from 'core/tooltip'

// Types
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

// Local Types
import { LeafletMapRenderer, Bounds, LeafletMapPointStyles, MapZoomState, LeafletMapPointDatum } from './types'

// Component
import { LeafletMap } from './index'

export interface LeafletMapConfigInterface<Datum> extends ComponentConfigInterface {
  // General
  /** Animation duration when the map is automatically panning or zooming to a point or area. Default: `1500` ms */
  flyToDuration?: number;
  /** Padding to be used when the `fitView` function has been called. The value is in pixels. Default: `[150, 150]` */
  fitViewPadding?: [number, number];
  /** Animation duration for the `setZoom` function. Default: `800` ms */
  zoomDuration?: number;
  /** Default bounds that will be applied on the first map render if the bounds property is not set. Default: `undefined` */
  initialBounds?: Bounds;
  /** Force set map bounds on config update. Default: `undefined` */
  bounds?: Bounds;
  /** The map renderer type. Default: `LeafletMapRenderer.Tangram` */
  renderer?: LeafletMapRenderer | string;
  /** External instance of Tangram to be used in the map. Default: `undefined` */
  tangramRenderer?: any;
  /** Mapboxgl Access Token or Nextzen API key. Default: `''` */
  accessToken?: string;
  /** Mapbox style glyphs URL. Default: `undefined` */
  mapboxglGlyphs?: string;
  /** Tangram or Mapbox sources settings. Default: `undefined` */
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
  pointRadius?: NumericAccessor<LeafletMapPointDatum<Datum>>;
  /** Point inner label accessor function */
  pointLabel?: StringAccessor<LeafletMapPointDatum<Datum>>;
  /** Point bottom label accessor function */
  pointBottomLabel?: StringAccessor<LeafletMapPointDatum<Datum>>;
  /** Point cursor value or accessor function, Default: `null` */
  pointCursor?: StringAccessor<LeafletMapPointDatum<Datum>>;
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
  valuesMap?: LeafletMapPointStyles;

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
  fitViewPadding = [150, 150] as [number, number]
  zoomDuration = 800
  initialBounds = undefined
  bounds = undefined
  renderer = LeafletMapRenderer.Tangram
  attribution = []
  accessToken = ''
  tangramRenderer = undefined
  mapboxglGlyphs = undefined
  sources = undefined
  rendererSettings = undefined

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
  pointLabel = (d: LeafletMapPointDatum<Datum>): string => `${d.point_count ?? ''}`
  pointBottomLabel = (d: LeafletMapPointDatum<Datum>): string => ''
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
