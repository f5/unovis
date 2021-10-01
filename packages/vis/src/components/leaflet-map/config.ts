// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation, no-irregular-whitespace */
import { Style } from 'maplibre-gl'

// Core
import { ComponentConfig, ComponentConfigInterface } from 'core/component/config'
import { Tooltip } from 'components/tooltip'

// Types
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

// Local Types
import { LeafletMapRenderer, Bounds, LeafletMapPointStyles, MapZoomState, LeafletMapPointDatum } from './types'

// Renderer settings
import { TangramScene } from './renderer/map-style'

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
  /** Tangram Scene or Mapbox Style settings. Default: `undefined` */
  rendererSettings: TangramScene | Style;
  /** Tile server access token or API key. Default: `''` */
  accessToken?: string;
  /** Array of attribution labels. Default: `['<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>']` */
  attribution?: string[];

  // Map events
  /** Function to be called after Map async initialization is done. Default: `undefined` */
  onMapInitialized?: (() => void);
  /** Map Move / Zoom joint callback function. Default: `undefined` */
  onMapMoveZoom?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);
  /** Move Move Start callback function. Default: `undefined` */
  onMapMoveStart?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);
  /** Move Move End callback function. Default: `undefined` */
  onMapMoveEnd?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);
  /** Move Zoom Start callback function. Default: `undefined` */
  onMapZoomStart?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);
  /** Move Zoom End callback function. Default: `undefined` */
  onMapZoomEnd?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);
  /** Move Zoom End callback function. Default: `undefined` */
  onMapClick?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);

  // Point
  /** Point longitude accessor function. Default: `d => d.longitude` */
  pointLongitude?: NumericAccessor<Datum>;
  /** Point latitude accessor function. Default: `d => d.latitude` */
  pointLatitude?: NumericAccessor<Datum>;
  /** Point id accessor function or constant value. Default: `d => d.id`  */
  pointId?: StringAccessor<Datum>;
  /** Point shape accessor function or constant value. Default: `d => d.shape`  */
  pointShape?: StringAccessor<Datum>;
  /** Point color accessor function or constant value. Default: `d => d.color`  */
  pointColor?: ColorAccessor<Datum>;
  /** Point radius accessor function or constant value. Default: `undefined`  */
  pointRadius?: NumericAccessor<LeafletMapPointDatum<Datum>>;
  /** Point inner label accessor function. Default: `d => d.point_count ?? ''`  */
  pointLabel?: StringAccessor<LeafletMapPointDatum<Datum>>;
  /** Point bottom label accessor function. Default: `''` */
  pointBottomLabel?: StringAccessor<LeafletMapPointDatum<Datum>>;
  /** Point cursor value or accessor function. Default: `null` */
  pointCursor?: StringAccessor<LeafletMapPointDatum<Datum>>;
  /** Set selected node by its unique id. Default: `undefined` */
  selectedNodeId?: string;

  // Cluster
  /** The width of the cluster point outline. Default: `1.25` */
  clusterOutlineWidth?: number;
  /** When cluster is expanded, show a background circle to netter separate points from the base map. Default: `true` */
  clusterBackground?: boolean;
  /** Defines whether the cluster should expand on click or not. Default: `true` */
  clusterExpandOnClick?: boolean;
  /** Clustering radius in pixels. This value will be passed to Supercluster https://github.com/mapbox/supercluster. Default: `55` */
  clusterRadius?: number;
  /** A single map point can have multiple properties displayed as a small pie chart (or a donut chart for a cluster of points).
   * By setting the valuesMap configuration you can specify data properties that should be mapped to various pie / donut segments.
   *
   * ```
   * {
   *   [key in keyof Datum]?: { color: string, className?: string }
   * }
   * ```
   * e.g.:
   * ```
   * {
   *   healthy: { color: 'green' },
   *   warning: { color: 'orange' },
   *   danger: { color: 'red' }
   * }
   * ```
   * where every data point has the `healthy`, `warning` and `danger` numerical or boolean property.
   */
  valuesMap?: LeafletMapPointStyles<Datum>;

  // TopoJSON overlay
  /** Only for MapLibreGL Renderer. A TopoJSON Geometry layer to be displayed on top of the map. Supports fill and stroke */
  topoJSONLayer?: {
    /** The TopoJSON.Topology object. Default: `undefined` */
    sources?: any;
    /** Name of the geometry feature to be displayed. Default: `undefined` */
    featureName?: string;
    /** Name of the property to be used for defining the fill color of the geometry. Default: `undefined` */
    fillProperty?: string;
    /** Name of the property to be used for defining the stroke color of the geometry. Default: `undefined` */
    strokeProperty?: string;
    /** Geometry fill opacity value. Default: `0.6` */
    fillOpacity?: number;
    /** Geometry stroke opacity value. Default: `0.8` */
    strokeOpacity?: number;
    /** Geometry stroke width. Default: `2` */
    strokeWidth?: number;
  };

  // Misc
  /** Tooltip component. Default: `undefined` */
  tooltip?: Tooltip;
}

export class LeafletMapConfig<Datum> extends ComponentConfig implements LeafletMapConfigInterface<Datum> {
  // General
  flyToDuration = 1500
  fitViewPadding = [150, 150] as [number, number]
  zoomDuration = 800
  initialBounds = undefined
  bounds = undefined
  renderer = LeafletMapRenderer.Tangram
  attribution = ['<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>']
  tangramRenderer = undefined
  accessToken = ''
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
  pointBottomLabel = ''
  pointCursor = null
  selectedNodeId = undefined

  // Cluster
  clusterOutlineWidth = 1.25
  clusterBackground = true
  clusterExpandOnClick = true;
  clusterRadius = 55
  valuesMap = {} as LeafletMapPointStyles<Datum>

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
