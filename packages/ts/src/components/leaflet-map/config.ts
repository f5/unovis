/* eslint-disable no-irregular-whitespace */

// Core
import { ComponentDefaultConfig, ComponentConfigInterface } from 'core/component/config'
import { Tooltip } from 'components/tooltip'

// Types
import { ColorAccessor, GenericAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { GenericDataRecord } from 'types/data'

// Local Types
import {
  Bounds,
  LeafletMapPointStyles,
  MapZoomState,
  LeafletMapPointDatum,
  LeafletMapPointShape,
  LeafletMapClusterDatum,
  LeafletMapRenderer,
} from './types'

// Renderer settings
import { MapLibreStyleSpecs } from './renderer/map-style'

export interface LeafletMapConfigInterface<Datum extends GenericDataRecord> extends ComponentConfigInterface {
  // General
  /** Width in pixels or in CSS units. By default, the map will automatically fit to the size of the parent element. Default: `undefined`. */
  width?: number | string;
  /** Height in pixels or in CSS units. By default, the map will automatically fit to the size of the parent element. Default: `undefined`. */
  height?: number | string;
  /** Animation duration when the map is automatically panning or zooming to a point or area. Default: `1500` ms */
  flyToDuration?: number;
  /** Padding to be used when the `fitView` function has been called. The value is in pixels, [topLeft, bottomRight]. Default: `[150, 150]` */
  fitViewPadding?: [number, number];
  /** Animation duration for the `setZoom` function. Default: `800` ms */
  zoomDuration?: number;
  /** Default bounds that will be applied on the first map render if the bounds property is not set. Default: `undefined` */
  initialBounds?: Bounds;
  /** Force set map bounds on config and data updates. Default: `undefined` */
  fitBoundsOnUpdate?: Bounds;
  /** Fit the view to contain the data points on map initialization. Default: `true` */
  fitViewOnInit?: boolean;
  /** Fit the view to contain the data points on map config and data updates. Default: `false` */
  fitViewOnUpdate?: boolean;
  /** MapLibre `StyleSpecification` settings, or a URL to it. When renderer is set to`LeafletMapRenderer.Raster`, provide a template URL. Default: `undefined` */
  style: MapLibreStyleSpecs | string | undefined;
  /** MapLibre `StyleSpecification` settings or URL for dark theme. Default: `undefined` */
  styleDarkTheme?: MapLibreStyleSpecs | string | undefined;
  /** Tile server access token or API key. Default: `''` */
  accessToken?: string;
  /** Array of attribution labels. Default: `['<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>']` */
  attribution?: string[];
  /** Rendering mode for map's tile layer. For raster files, use `LeafletMapRenderer.Raster`. Default: `LeafletMapRenderer.MapLibre` */
  renderer?: LeafletMapRenderer | string;

  // Map events
  /** Function to be called after the map's async initialization is done. Default: `undefined` */
  onMapInitialized?: (() => void);
  /** Map Move / Zoom unified callback function. Default: `undefined` */
  onMapMoveZoom?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);
  /** Map Move Start callback function. Default: `undefined` */
  onMapMoveStart?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);
  /** Map Move End callback function. Default: `undefined` */
  onMapMoveEnd?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);
  /** Map Zoom Start callback function. Default: `undefined` */
  onMapZoomStart?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);
  /** Map Zoom End callback function. Default: `undefined` */
  onMapZoomEnd?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);
  /** Map Zoom Click callback function. Default: `undefined` */
  onMapClick?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void);

  // Point
  /** Point longitude accessor function. Default: `d => d.longitude` */
  pointLongitude?: NumericAccessor<Datum>;
  /** Point latitude accessor function. Default: `d => d.latitude` */
  pointLatitude?: NumericAccessor<Datum>;
  /** Point id accessor function or constant value. Default: `d => d.id`  */
  pointId?: StringAccessor<Datum>;
  /** Point shape accessor function or constant value. Default: `d => d.shape`  */
  pointShape?: GenericAccessor<LeafletMapPointShape | string, Datum>;
  /** Point color accessor function or constant value. Default: `d => d.color`  */
  pointColor?: ColorAccessor<LeafletMapPointDatum<Datum>>;
  /** Point radius accessor function or constant value. Default: `undefined`  */
  pointRadius?: NumericAccessor<LeafletMapPointDatum<Datum>>;
  /** Point inner label accessor function. Default: `undefined`  */
  pointLabel?: StringAccessor<LeafletMapPointDatum<Datum>>;
  /** Point inner label color accessor function or constant value.
   * By default, the label color will be set, depending on the point brightness, either to
   * `--vis-map-point-inner-label-text-color-light` or to `--vis-map-point-inner-label-text-color-dark` CSS variable.
   * Default: `undefined`
  */
  pointLabelColor?: StringAccessor<LeafletMapPointDatum<Datum>>;
  /** Point bottom label accessor function. Default: `''` */
  pointBottomLabel?: StringAccessor<LeafletMapPointDatum<Datum>>;
  /** Point cursor value or accessor function. Default: `null` */
  pointCursor?: StringAccessor<LeafletMapPointDatum<Datum>>;
  /** The width of the ring when a point has a `LeafletMapPointShape.Ring` shape. Default: `1.25` */
  pointRingWidth?: number;
  /** Set selected point by its unique id. Default: `undefined` */
  selectedPointId?: string;

  // Cluster
  /** Cluster color accessor function or constant value. Default: `undefined`  */
  clusterColor?: ColorAccessor<LeafletMapClusterDatum<Datum>>;
  /** Cluster radius accessor function or constant value. Default: `undefined`  */
  clusterRadius?: NumericAccessor<LeafletMapClusterDatum<Datum>>;
  /** Cluster inner label accessor function. Default: `d => d.point_count`  */
  clusterLabel?: StringAccessor<LeafletMapClusterDatum<Datum>>;
  /** Cluster inner label color accessor function or constant value.
   * By default, the label color will be set, depending on the point brightness, either to
   * `--vis-map-cluster-inner-label-text-color-light` or to `--vis-map-cluster-inner-label-text-color-dark` CSS variable.
   * Default: `undefined`
  */
  clusterLabelColor?: StringAccessor<LeafletMapClusterDatum<Datum>>;
  /** Cluster bottom label accessor function. Default: `''` */
  clusterBottomLabel?: StringAccessor<LeafletMapClusterDatum<Datum>>;
  /** The width of the cluster point ring. Default: `1.25` */
  clusterRingWidth?: number;
  /** When cluster is expanded, show a background circle to better separate points from the base map. Default: `true` */
  clusterBackground?: boolean;
  /** Defines whether the cluster should expand on click or not. Default: `true` */
  clusterExpandOnClick?: boolean;
  /** Clustering distance in pixels. This value will be passed to Supercluster as the `radius` property https://github.com/mapbox/supercluster. Default: `55` */
  clusteringDistance?: number;
  /** A single map point can have multiple properties displayed as a small pie chart (or a donut chart for a cluster of points).
   * By setting the colorMap configuration you can specify data properties that should be mapped to various pie / donut segments.
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
  colorMap?: LeafletMapPointStyles<Datum>;

  // TopoJSON overlay
  /** A TopoJSON Geometry layer to be displayed on top of the map. Supports fill and stroke */
  topoJSONLayer?: {
    /** The TopoJSON.Topology object. Default: `undefined` */
    sources: any;
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

  /** Alternative text description of the chart for accessibility purposes. It will be applied as an
   * `aria-label` attribute to the div element containing your chart. Default: `undefined`.
  */
  ariaLabel?: string | null | undefined;
}

export const LeafletMapDefaultConfig: LeafletMapConfigInterface<GenericDataRecord> = {
  ...ComponentDefaultConfig,
  // General
  width: undefined,
  height: undefined,
  flyToDuration: 1500,
  fitViewPadding: [150, 150],
  zoomDuration: 800,
  initialBounds: undefined,
  fitBoundsOnUpdate: undefined,
  fitViewOnInit: true,
  fitViewOnUpdate: false,
  attribution: ['<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'],
  accessToken: '',
  style: undefined,
  styleDarkTheme: undefined,
  renderer: LeafletMapRenderer.MapLibre,

  // Map events
  onMapInitialized: undefined,
  onMapMoveZoom: undefined,
  onMapMoveStart: undefined,
  onMapMoveEnd: undefined,
  onMapZoomStart: undefined,
  onMapZoomEnd: undefined,
  onMapClick: undefined,

  // Point
  pointLongitude: (d: unknown): number => (d as { longitude: number }).longitude,
  pointLatitude: (d: unknown): number => (d as { latitude: number }).latitude,
  pointId: (d: unknown): string => (d as { id: string }).id,
  pointShape: (d: unknown): string => (d as { shape: string }).shape,
  pointColor: (d: unknown): string => (d as { color: string }).color,
  pointRadius: undefined,
  pointLabel: undefined,
  pointLabelColor: undefined,
  pointBottomLabel: '',
  pointCursor: null,
  pointRingWidth: 1.25,
  selectedPointId: undefined,

  // Cluster
  clusterColor: undefined,
  clusterRadius: undefined,
  clusterLabel: <Datum extends GenericDataRecord>(d: LeafletMapClusterDatum<Datum>): string => `${d.point_count}`,
  clusterLabelColor: undefined,
  clusterBottomLabel: '',
  clusterRingWidth: 1.25,
  clusterBackground: true,
  clusterExpandOnClick: true,
  clusteringDistance: 55,
  colorMap: {},

  // TopoJSON Overlay
  topoJSONLayer: {
    sources: undefined,
    fillOpacity: 0.6,
    strokeOpacity: 0.8,
    strokeWidth: 1,
    featureName: undefined,
    fillProperty: undefined,
    strokeProperty: undefined,
  },

  // Misc
  tooltip: undefined,
  ariaLabel: undefined,
}
