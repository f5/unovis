// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core'
import {
  LeafletMap,
  LeafletMapConfigInterface,
  GenericDataRecord,
  VisEventType,
  VisEventCallback,
  Bounds,
  MapLibreStyleSpecs,
  LeafletMapRenderer,
  MapZoomState,
  NumericAccessor,
  StringAccessor,
  GenericAccessor,
  LeafletMapPointShape,
  ColorAccessor,
  LeafletMapPointDatum,
  LeafletMapClusterDatum,
  LeafletMapPointStyles,
  Tooltip,
} from '@unovis/ts'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-leaflet-map',
  template: '<div #container class="leaflet-map-container"></div>',
  styles: ['.leaflet-map-container { width: 100%; height: 100%; position: relative }'],
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisLeafletMapComponent }],
  standalone: false,
})
export class VisLeafletMapComponent<Datum extends GenericDataRecord> implements LeafletMapConfigInterface<Datum>, AfterViewInit {
  @ViewChild('container', { static: false }) containerRef: ElementRef

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

  /** Width in pixels or in CSS units. By default, the map will automatically fit to the size of the parent element. Default: `undefined`. */
  @Input() width?: number | string

  /** Height in pixels or in CSS units. By default, the map will automatically fit to the size of the parent element. Default: `undefined`. */
  @Input() height?: number | string

  /** Animation duration when the map is automatically panning or zooming to a point or area. Default: `1500` ms */
  @Input() flyToDuration?: number

  /** Padding to be used when the `fitView` function has been called. The value is in pixels, [topLeft, bottomRight]. Default: `[150, 150]` */
  @Input() fitViewPadding?: [number, number]

  /** Animation duration for the `setZoom` function. Default: `800` ms */
  @Input() zoomDuration?: number

  /** Default bounds that will be applied on the first map render if the bounds property is not set. Default: `undefined` */
  @Input() initialBounds?: Bounds

  /** Force set map bounds on config and data updates. Default: `undefined` */
  @Input() fitBoundsOnUpdate?: Bounds

  /** Fit the view to contain the data points on map initialization. Default: `true` */
  @Input() fitViewOnInit?: boolean

  /** Fit the view to contain the data points on map config and data updates. Default: `false` */
  @Input() fitViewOnUpdate?: boolean

  /** MapLibre `StyleSpecification` settings, or a URL to it. When renderer is set to`LeafletMapRenderer.Raster`, provide a template URL. Default: `undefined` */
  @Input() style: MapLibreStyleSpecs | string | undefined

  /** MapLibre `StyleSpecification` settings or URL for dark theme. Default: `undefined` */
  @Input() styleDarkTheme?: MapLibreStyleSpecs | string | undefined

  /** Tile server access token or API key. Default: `''` */
  @Input() accessToken?: string

  /** Array of attribution labels. Default: `['<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>']` */
  @Input() attribution?: string[]

  /** Rendering mode for map's tile layer. For raster files, use `LeafletMapRenderer.Raster`. Default: `LeafletMapRenderer.MapLibre` */
  @Input() renderer?: LeafletMapRenderer | string

  /** Function to be called after the map's async initialization is done. Default: `undefined` */
  @Input() onMapInitialized?: (() => void)

  /** Map Move / Zoom unified callback function. Default: `undefined` */
  @Input() onMapMoveZoom?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Map Move Start callback function. Default: `undefined` */
  @Input() onMapMoveStart?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Map Move End callback function. Default: `undefined` */
  @Input() onMapMoveEnd?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Map Zoom Start callback function. Default: `undefined` */
  @Input() onMapZoomStart?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Map Zoom End callback function. Default: `undefined` */
  @Input() onMapZoomEnd?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Map Zoom Click callback function. Default: `undefined` */
  @Input() onMapClick?: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => void)

  /** Point longitude accessor function. Default: `d => d.longitude` */
  @Input() pointLongitude?: NumericAccessor<Datum>

  /** Point latitude accessor function. Default: `d => d.latitude` */
  @Input() pointLatitude?: NumericAccessor<Datum>

  /** Point id accessor function or constant value. Default: `d => d.id` */
  @Input() pointId?: StringAccessor<Datum>

  /** Point shape accessor function or constant value. Default: `d => d.shape` */
  @Input() pointShape?: GenericAccessor<LeafletMapPointShape | string, Datum>

  /** Point color accessor function or constant value. Default: `d => d.color` */
  @Input() pointColor?: ColorAccessor<LeafletMapPointDatum<Datum>>

  /** Point radius accessor function or constant value. Default: `undefined` */
  @Input() pointRadius?: NumericAccessor<LeafletMapPointDatum<Datum>>

  /** Point inner label accessor function. Default: `undefined` */
  @Input() pointLabel?: StringAccessor<LeafletMapPointDatum<Datum>>

  /** Point inner label color accessor function or constant value.
   * By default, the label color will be set, depending on the point brightness, either to
   * `--vis-map-point-inner-label-text-color-light` or to `--vis-map-point-inner-label-text-color-dark` CSS variable.
   * Default: `undefined` */
  @Input() pointLabelColor?: StringAccessor<LeafletMapPointDatum<Datum>>

  /** Point bottom label accessor function. Default: `''` */
  @Input() pointBottomLabel?: StringAccessor<LeafletMapPointDatum<Datum>>

  /** Point cursor value or accessor function. Default: `null` */
  @Input() pointCursor?: StringAccessor<LeafletMapPointDatum<Datum>>

  /** The width of the ring when a point has a `LeafletMapPointShape.Ring` shape. Default: `1.25` */
  @Input() pointRingWidth?: number

  /** Set selected point by its unique id. Default: `undefined` */
  @Input() selectedPointId?: string

  /** Cluster color accessor function or constant value. Default: `undefined` */
  @Input() clusterColor?: ColorAccessor<LeafletMapClusterDatum<Datum>>

  /** Cluster radius accessor function or constant value. Default: `undefined` */
  @Input() clusterRadius?: NumericAccessor<LeafletMapClusterDatum<Datum>>

  /** Cluster inner label accessor function. Default: `d => d.point_count` */
  @Input() clusterLabel?: StringAccessor<LeafletMapClusterDatum<Datum>>

  /** Cluster inner label color accessor function or constant value.
   * By default, the label color will be set, depending on the point brightness, either to
   * `--vis-map-cluster-inner-label-text-color-light` or to `--vis-map-cluster-inner-label-text-color-dark` CSS variable.
   * Default: `undefined` */
  @Input() clusterLabelColor?: StringAccessor<LeafletMapClusterDatum<Datum>>

  /** Cluster bottom label accessor function. Default: `''` */
  @Input() clusterBottomLabel?: StringAccessor<LeafletMapClusterDatum<Datum>>

  /** The width of the cluster point ring. Default: `1.25` */
  @Input() clusterRingWidth?: number

  /** When cluster is expanded, show a background circle to better separate points from the base map. Default: `true` */
  @Input() clusterBackground?: boolean

  /** Defines whether the cluster should expand on click or not. Default: `true` */
  @Input() clusterExpandOnClick?: boolean

  /** Clustering distance in pixels. This value will be passed to Supercluster as the `radius` property https://github.com/mapbox/supercluster. Default: `55` */
  @Input() clusteringDistance?: number

  /** A single map point can have multiple properties displayed as a small pie chart (or a donut chart for a cluster of points).
   * By setting the colorMap configuration you can specify data properties that should be mapped to various pie / donut segments.
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
  @Input() colorMap?: LeafletMapPointStyles<Datum>

  /** A TopoJSON Geometry layer to be displayed on top of the map. Supports fill and stroke */
  @Input() topoJSONLayer?: {
    sources: any;
    featureName?: string;
    fillProperty?: string;
    strokeProperty?: string;
    fillOpacity?: number;
    strokeOpacity?: number;
    strokeWidth?: number;
  }

  /** Tooltip component. Default: `undefined` */
  @Input() tooltip?: Tooltip

  /** Alternative text description of the chart for accessibility purposes. It will be applied as an
   * `aria-label` attribute to the div element containing your chart. Default: `undefined`. */
  @Input() ariaLabel?: string | null | undefined
  @Input() data: Datum[]

  component: LeafletMap<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new LeafletMap<Datum>(this.containerRef.nativeElement, this.getConfig(), this.data)

    if (this.data) {
      this.component.setData(this.data)
    }
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): LeafletMapConfigInterface<Datum> {
    const { duration, events, attributes, width, height, flyToDuration, fitViewPadding, zoomDuration, initialBounds, fitBoundsOnUpdate, fitViewOnInit, fitViewOnUpdate, style, styleDarkTheme, accessToken, attribution, renderer, onMapInitialized, onMapMoveZoom, onMapMoveStart, onMapMoveEnd, onMapZoomStart, onMapZoomEnd, onMapClick, pointLongitude, pointLatitude, pointId, pointShape, pointColor, pointRadius, pointLabel, pointLabelColor, pointBottomLabel, pointCursor, pointRingWidth, selectedPointId, clusterColor, clusterRadius, clusterLabel, clusterLabelColor, clusterBottomLabel, clusterRingWidth, clusterBackground, clusterExpandOnClick, clusteringDistance, colorMap, topoJSONLayer, tooltip, ariaLabel } = this
    const config = { duration, events, attributes, width, height, flyToDuration, fitViewPadding, zoomDuration, initialBounds, fitBoundsOnUpdate, fitViewOnInit, fitViewOnUpdate, style, styleDarkTheme, accessToken, attribution, renderer, onMapInitialized, onMapMoveZoom, onMapMoveStart, onMapMoveEnd, onMapZoomStart, onMapZoomEnd, onMapClick, pointLongitude, pointLatitude, pointId, pointShape, pointColor, pointRadius, pointLabel, pointLabelColor, pointBottomLabel, pointCursor, pointRingWidth, selectedPointId, clusterColor, clusterRadius, clusterLabel, clusterLabelColor, clusterBottomLabel, clusterRingWidth, clusterBackground, clusterExpandOnClick, clusteringDistance, colorMap, topoJSONLayer, tooltip, ariaLabel }
    const keys = Object.keys(config) as (keyof LeafletMapConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
