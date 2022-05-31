import { Component, AfterViewInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core'
import {
  LeafletFlowMap,
  LeafletFlowMapConfigInterface,
  VisEventType,
  VisEventCallback,
  Bounds,
  MapZoomState,
  NumericAccessor,
  StringAccessor,
  ColorAccessor,
  LeafletMapPointDatum,
  LeafletMapPointStyles,
  Tooltip,
} from '@volterra/vis'
import { StyleSpecification } from 'maplibre-gl'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-leaflet-flow-map',
  template: '<div #container class="unovis-leaflet-flow-map-container"></div>',
  styles: ['.unovis-leaflet-flow-map-container { width: 100%; height: 100%; position: relative; }'],
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisLeafletFlowMapComponent }],
})
export class VisLeafletFlowMapComponent<PointDatum, FlowDatum> implements LeafletFlowMapConfigInterface<PointDatum, FlowDatum>, AfterViewInit {
  @ViewChild('container', { static: false }) containerRef: ElementRef

  /** Width in pixels or in CSS units. By default, the map will automatically fit to the size of the parent element. Default: `undefined`. */
  @Input() width?: number | string;
  /** Height in pixels or in CSS units. By default, the map will automatically fit to the size of the parent element. Default: `undefined`. */
  @Input() height?: number | string;

  /** Animation duration of the data update transitions in milliseconds. Default: `600` */
  @Input() duration?: number

  /** Events configuration. An object containing properties in the following format:
   *
   * ```
   * {
   * \[selectorString]: {
   *     \[eventType]: callbackFunction
   *  }
   * }
   * ```
   * e.g.:
   * ```
   * {
   * \[Area.selectors.area]: {
   *    click: (d) => console.log("Clicked Area", d)
   *  }
   * }
   * ``` */
  @Input() events?: {
    [selector: string]: {
      [eventType in VisEventType]?: VisEventCallback
    };
  }

  /** You can set every SVG and HTML visualization object to have a custom DOM attributes, which is useful
   * when you want to do unit or end-to-end testing. Attributes configuration object has the following structure:
   *
   * ```
   * {
   * \[selectorString]: {
   *     \[attributeName]: attribute constant value or accessor function
   *  }
   * }
   * ```
   * e.g.:
   * ```
   * {
   * \[Area.selectors.area]: {
   *    "test-value": d => d.value
   *  }
   * }
   * ``` */
  @Input() attributes?: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** Animation duration when the map is automatically panning or zooming to a point or area. Default: `1500` ms */
  @Input() flyToDuration?: number

  /** Padding to be used when the `fitView` function has been called. The value is in pixels. Default: `[150, 150]` */
  @Input() fitViewPadding?: [number, number]

  /** Animation duration for the `setZoom` function. Default: `800` ms */
  @Input() zoomDuration?: number

  /** Default bounds that will be applied on the first map render if the bounds property is not set. Default: `undefined` */
  @Input() initialBounds?: Bounds

  /** Force set map bounds on config update. Default: `undefined` */
  @Input() bounds?: Bounds

  /** MapLibre StyleSpecification settings. Default: `MapLibreArcticLight` */
  @Input() style: StyleSpecification | string

  /** MapLibre StyleSpecification settings for dark theme. Default: `undefined` */
  @Input() styleDarkTheme: StyleSpecification | string

  /** Tile server access token or API key. Default: `''` */
  @Input() accessToken?: string

  /** Array of attribution labels. Default: `['<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>']` */
  @Input() attribution?: string[]

  /** Function to be called after Map async initialization is done. Default: `undefined` */
  @Input() onMapInitialized?: (() => void)

  /** Map Move / Zoom joint callback function. Default: `undefined` */
  @Input() onMapMoveZoom?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Move Move Start callback function. Default: `undefined` */
  @Input() onMapMoveStart?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Move Move End callback function. Default: `undefined` */
  @Input() onMapMoveEnd?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Move Zoom Start callback function. Default: `undefined` */
  @Input() onMapZoomStart?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Move Zoom End callback function. Default: `undefined` */
  @Input() onMapZoomEnd?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Move Zoom End callback function. Default: `undefined` */
  @Input() onMapClick?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Point longitude accessor function. Default: `d => d.longitude` */
  @Input() pointLongitude?: NumericAccessor<PointDatum>

  /** Point latitude accessor function. Default: `d => d.latitude` */
  @Input() pointLatitude?: NumericAccessor<PointDatum>

  /** Point id accessor function or constant value. Default: `d => d.id` */
  @Input() pointId?: StringAccessor<PointDatum>

  /** Point shape accessor function or constant value. Default: `d => d.shape` */
  @Input() pointShape?: StringAccessor<PointDatum>

  /** Point color accessor function or constant value. Default: `d => d.color` */
  @Input() pointColor?: ColorAccessor<PointDatum>

  /** Point radius accessor function or constant value. Default: `undefined` */
  @Input() pointRadius?: NumericAccessor<LeafletMapPointDatum<PointDatum>>

  /** Point inner label accessor function. Default: `d => d.point_count ?? ''` */
  @Input() pointLabel?: StringAccessor<LeafletMapPointDatum<PointDatum>>

  /** Point bottom label accessor function. Default: `''` */
  @Input() pointBottomLabel?: StringAccessor<LeafletMapPointDatum<PointDatum>>

  /** Point cursor value or accessor function. Default: `null` */
  @Input() pointCursor?: StringAccessor<LeafletMapPointDatum<PointDatum>>

  /** Set selected point by its unique id. Default: `undefined` */
  @Input() selectedPointId?: string

  /** The width of the cluster point outline. Default: `1.25` */
  @Input() clusterOutlineWidth?: number

  /** When cluster is expanded, show a background circle to netter separate points from the base map. Default: `true` */
  @Input() clusterBackground?: boolean

  /** Defines whether the cluster should expand on click or not. Default: `true` */
  @Input() clusterExpandOnClick?: boolean

  /** Clustering radius in pixels. This value will be passed to Supercluster https://github.com/mapbox/supercluster. Default: `55` */
  @Input() clusterRadius?: number

  /** A single map point can have multiple properties displayed as a small pie chart (or a donut chart for a cluster of points).
   * By setting the valuesMap configuration you can specify data properties that should be mapped to various pie / donut segments.
   *
   * ```
   * {
   * \[key in keyof Datum]?: { color: string, className?: string }
   * }
   * ```
   * e.g.:
   * ```
   * {
   * \healthy: { color: 'green' },
   * \warning: { color: 'orange' },
   * \danger: { color: 'red' }
   * }
   * ```
   * where every data point has the `healthy`, `warning` and `danger` numerical or boolean property. */
  @Input() valuesMap?: LeafletMapPointStyles<PointDatum>

  /** A TopoJSON Geometry layer to be displayed on top of the map. Supports fill and stroke */
  @Input() topoJSONLayer?: {
    sources?: any;
    featureName?: string;
    fillProperty?: string;
    strokeProperty?: string;
    fillOpacity?: number;
    strokeOpacity?: number;
    strokeWidth?: number;
  }

  /** Tooltip component. Default: `undefined` */
  @Input() tooltip?: Tooltip

  /** Flow source point longitude accessor function or value. Default:.`f => f.sourceLongitude` */
  @Input() sourceLongitude?: NumericAccessor<FlowDatum>;
  /** Flow source point latitude accessor function or value. Default: `f => f.sourceLatitude` */
  @Input() sourceLatitude?: NumericAccessor<FlowDatum>;
  /** Flow target point longitude accessor function or value. Default: `f => f.targetLongitude` */
  @Input() targetLongitude?: NumericAccessor<FlowDatum>;
  /** Flow target point latitude accessor function or value. Default: `f => f.targetLatitude` */
  @Input() targetLatitude?: NumericAccessor<FlowDatum>;
  /** Flow source point radius accessor function or value. Default: `3` */
  @Input() sourcePointRadius?: NumericAccessor<FlowDatum>;
  /** Source point color accessor function or value. Default: `'#88919f'` */
  @Input() sourcePointColor?: ColorAccessor<FlowDatum>;
  /** Flow particle color accessor function or value. Default: `'#949dad'` */
  @Input() flowParticleColor?: ColorAccessor<FlowDatum>;
  /** Flow particle radius accessor function or value. Default: `1.1` */
  @Input() flowParticleRadius?: NumericAccessor<FlowDatum>;
  /** Flow particle speed accessor function or value in angular degrees. Default: `0.07` */
  @Input() flowParticleSpeed?: NumericAccessor<FlowDatum>;
  /** Flow particle density accessor function or value on the range of [0, 1]. Default: `0.6` */
  @Input() flowParticleDensity?: NumericAccessor<FlowDatum>;

  // Events
  /** Flow source point click callback function. Default: `undefined` */
  @Input() onSourcePointClick?: ((f: FlowDatum, x: number, y: number, event: MouseEvent) => unknown);
  /** Flow source point mouse over callback function. Default: `undefined` */
  @Input() onSourcePointMouseEnter?: ((f: FlowDatum, x: number, y: number, event: MouseEvent) => unknown);
  /** Flow source point mouse leave callback function. Default: `undefined` */
  @Input() onSourcePointMouseLeave?: ((f: FlowDatum, event: MouseEvent) => unknown);

  /** Data */
  @Input() data?: { points: PointDatum[]; flows: FlowDatum[] }

  component: LeafletFlowMap<PointDatum, FlowDatum> | undefined

  ngAfterViewInit (): void {
    const config = this.getConfig()
    this.component = new LeafletFlowMap<PointDatum, FlowDatum>(this.containerRef.nativeElement, config, this.data)
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) {
      this.component?.setData(this.data)
    }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): LeafletFlowMapConfigInterface<PointDatum, FlowDatum> {
    const { width, height, duration, events, attributes, flyToDuration, fitViewPadding, zoomDuration, initialBounds, bounds, accessToken, style, styleDarkTheme, attribution, onMapInitialized, onMapMoveZoom, onMapMoveStart, onMapMoveEnd, onMapZoomStart, onMapZoomEnd, onMapClick, pointLongitude, pointLatitude, pointId, pointShape, pointColor, pointRadius, pointLabel, pointBottomLabel, pointCursor, selectedPointId, clusterOutlineWidth, clusterBackground, clusterExpandOnClick, clusterRadius, valuesMap, topoJSONLayer, tooltip, sourceLongitude, sourceLatitude, targetLongitude, targetLatitude, sourcePointRadius, sourcePointColor, flowParticleColor, flowParticleRadius, flowParticleSpeed, flowParticleDensity, onSourcePointClick, onSourcePointMouseEnter, onSourcePointMouseLeave } = this
    const config = { width, height, duration, events, attributes, flyToDuration, fitViewPadding, zoomDuration, initialBounds, bounds, accessToken, style, styleDarkTheme, attribution, onMapInitialized, onMapMoveZoom, onMapMoveStart, onMapMoveEnd, onMapZoomStart, onMapZoomEnd, onMapClick, pointLongitude, pointLatitude, pointId, pointShape, pointColor, pointRadius, pointLabel, pointBottomLabel, pointCursor, selectedPointId, clusterOutlineWidth, clusterBackground, clusterExpandOnClick, clusterRadius, valuesMap, topoJSONLayer, tooltip, sourceLongitude, sourceLatitude, targetLongitude, targetLatitude, sourcePointRadius, sourcePointColor, flowParticleColor, flowParticleRadius, flowParticleSpeed, flowParticleDensity, onSourcePointClick, onSourcePointMouseEnter, onSourcePointMouseLeave }
    const keys = Object.keys(config) as (keyof LeafletFlowMapConfigInterface<PointDatum, FlowDatum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
