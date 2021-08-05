// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, AfterViewInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core'
import {
  LeafletMap,
  LeafletMapConfigInterface,
  Bounds,
  LeafletMapRenderer,
  MapZoomState,
  NumericAccessor,
  StringAccessor,
  ColorAccessor,
  LeafletMapPointDatum,
  LeafletMapPointStyles,
  Tooltip,
} from '@volterra/vis'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-leaflet-map',
  template: '<div #container class="container"></div>',
  styles: ['.container { width: 100%; height: 100%; position: relative; }'],
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisLeafletMapComponent }],
})
export class VisLeafletMapComponent<Datum> implements LeafletMapConfigInterface<Datum>, AfterViewInit {
  @ViewChild('container', { static: false }) containerRef: ElementRef

  /** Animation duration */
  @Input() duration: number

  /** Events */
  @Input() events: {
    [selector: string]: {
      [eventName: string]: (data: any, event?: Event, i?: number, els?: SVGElement[] | HTMLElement[]) => void;
    };
  }

  /** Custom attributes */
  @Input() attributes: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** Animation duration when the map is automatically panning or zooming to a point or area. Default: `1500` ms */
  @Input() flyToDuration: number

  /** Padding to be used when the `fitView` function has been called. The value is in pixels. Default: `[150, 150]` */
  @Input() fitViewPadding: [number, number]

  /** Animation duration for the `setZoom` function. Default: `800` ms */
  @Input() zoomDuration: number

  /** Default bounds that will be applied on the first map render if the bounds property is not set. Default: `undefined` */
  @Input() initialBounds: Bounds

  /** Force set map bounds on config update. Default: `undefined` */
  @Input() bounds: Bounds

  /** The map renderer type. Default: `LeafletMapRenderer.Tangram` */
  @Input() renderer: LeafletMapRenderer | string

  /** External instance of Tangram to be used in the map. Default: `undefined` */
  @Input() tangramRenderer: any

  /** Mapboxgl Access Token or Nextzen API key. Default: `''` */
  @Input() accessToken: string

  /** Mapbox style glyphs URL. Default: `undefined` */
  @Input() mapboxglGlyphs: string

  /** Tangram or Mapbox sources settings. Default: `undefined` */
  @Input() sources: Record<string, unknown>

  /** Tangram or Mapbox style renderer settings */
  @Input() rendererSettings: Record<string, unknown>

  /** Array of attribution labels */
  @Input() attribution: string[]

  /** Function to be called after Map async initialization is done. Default: `undefined` */
  @Input() onMapInitialized: (() => any)

  /** Map Move / Zoom joint callback function. Default: `undefined` */
  @Input() onMapMoveZoom: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any)

  /** Move Move Start callback function. Default: `undefined` */
  @Input() onMapMoveStart: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any)

  /** Move Move End callback function. Default: `undefined` */
  @Input() onMapMoveEnd: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any)

  /** Move Zoom Start callback function. Default: `undefined` */
  @Input() onMapZoomStart: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any)

  /** Move Zoom End callback function. Default: `undefined` */
  @Input() onMapZoomEnd: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any)

  /** Move Zoom End callback function. Default: `undefined` */
  @Input() onMapClick: (({ mapCenter, zoomLevel, bounds }: MapZoomState) => any)

  /** Point longitude accessor function or value */
  @Input() pointLongitude: NumericAccessor<Datum>

  /** Point latitude accessor function or value */
  @Input() pointLatitude: NumericAccessor<Datum>

  /** Point id accessor function or value */
  @Input() pointId: StringAccessor<Datum>

  /** Point shape accessor function or value */
  @Input() pointShape: StringAccessor<Datum>

  /** Point color accessor function or value */
  @Input() pointColor: ColorAccessor<Datum>

  /** Point radius accessor function or value */
  @Input() pointRadius: NumericAccessor<LeafletMapPointDatum<Datum>>

  /** Point inner label accessor function */
  @Input() pointLabel: StringAccessor<LeafletMapPointDatum<Datum>>

  /** Point bottom label accessor function */
  @Input() pointBottomLabel: StringAccessor<LeafletMapPointDatum<Datum>>

  /** Point cursor value or accessor function, Default: `null` */
  @Input() pointCursor: StringAccessor<LeafletMapPointDatum<Datum>>

  /**  */
  @Input() selectedNodeId: string

  /** Cluster point outline width */
  @Input() clusterOutlineWidth: number

  /** Use cluster background */
  @Input() clusterBackground: boolean

  /** Defines whether the cluster should expand on click or not. Default: `false` */
  @Input() clusterExpandOnClick: boolean

  /** Clustering radius. Default: `45` */
  @Input() clusterRadius: number

  /** Status styles */
  @Input() valuesMap: LeafletMapPointStyles

  /** A TopoJSON Geometry layer to be displayed on top of the map. Supports fill and stroke */
  @Input() topoJSONLayer: {
    sources?: any;
    featureName?: string;
    fillProperty?: string;
    strokeProperty?: string;
    fillOpacity?: number;
    strokeOpacity?: number;
    strokeWidth?: number;
  }

  /** Tooltip component */
  @Input() tooltip: Tooltip<LeafletMap<Datum>, Datum>

  /** Data */
  @Input() data: Datum[]

  component: LeafletMap<Datum> | undefined

  ngAfterViewInit (): void {
    const config = this.getConfig()
    this.component = new LeafletMap<Datum>(this.containerRef.nativeElement, config)
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): LeafletMapConfigInterface<Datum> {
    const { duration, events, attributes, flyToDuration, fitViewPadding, zoomDuration, initialBounds, bounds, renderer, tangramRenderer, accessToken, mapboxglGlyphs, sources, rendererSettings, attribution, onMapInitialized, onMapMoveZoom, onMapMoveStart, onMapMoveEnd, onMapZoomStart, onMapZoomEnd, onMapClick, pointLongitude, pointLatitude, pointId, pointShape, pointColor, pointRadius, pointLabel, pointBottomLabel, pointCursor, selectedNodeId, clusterOutlineWidth, clusterBackground, clusterExpandOnClick, clusterRadius, valuesMap, topoJSONLayer, tooltip } = this
    const config = { duration, events, attributes, flyToDuration, fitViewPadding, zoomDuration, initialBounds, bounds, renderer, tangramRenderer, accessToken, mapboxglGlyphs, sources, rendererSettings, attribution, onMapInitialized, onMapMoveZoom, onMapMoveStart, onMapMoveEnd, onMapZoomStart, onMapZoomEnd, onMapClick, pointLongitude, pointLatitude, pointId, pointShape, pointColor, pointRadius, pointLabel, pointBottomLabel, pointCursor, selectedNodeId, clusterOutlineWidth, clusterBackground, clusterExpandOnClick, clusterRadius, valuesMap, topoJSONLayer, tooltip }
    const keys = Object.keys(config) as (keyof LeafletMapConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
