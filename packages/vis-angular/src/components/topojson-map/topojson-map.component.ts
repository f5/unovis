/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  TopoJSONMap,
  TopoJSONMapConfigInterface,
  MapInputNode,
  MapInputLink,
  MapInputArea,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  StringAccessor,
} from '@volterra/vis'
import { GeoProjection } from 'd3-geo'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-topojson-map',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisTopoJSONMapComponent }],
})
export class VisTopoJSONMapComponent<N extends MapInputNode = MapInputNode, L extends MapInputLink = MapInputLink, A extends MapInputArea = MapInputArea> implements TopoJSONMapConfigInterface<N, L, A>, AfterViewInit {
  /** Animation duration of the data update transitions in milliseconds. Default: `600` */
  @Input() duration: number

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
  @Input() events: {
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
  @Input() attributes: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** MapProjection (or D3's GeoProjection) instance. Default: `MapProjection.Mercator()` */
  @Input() projection: GeoProjection

  /** Map data in the TopoJSON topology format. Default: `undefined` */
  @Input() topojson: TopoJSON.Topology

  /** Name of the map features to be displayed, e.g. 'countries' or 'counties'. Default: `countries` */
  @Input() mapFeatureName: string

  /** Set initial map fit to points instead of topojson features. Default: `false` */
  @Input() mapFitToPoints: boolean

  /** Initial zoom level. Default: `undefined` */
  @Input() zoomFactor: number

  /** Disable pan / zoom interactions. Default: `false` */
  @Input() disableZoom: boolean

  /** Zoom extent. Default: `[1, 6]` */
  @Input() zoomExtent: number[]

  /** Zoom animation duration. Default: `400` */
  @Input() zoomDuration: number

  /** Link width value or accessor function. Default: `d => d.width ?? 1` */
  @Input() linkWidth: NumericAccessor<L>

  /** Link color value or accessor function. Default: `d => d.color ?? null` */
  @Input() linkColor: ColorAccessor<L>

  /** Link cursor value or accessor function. Default: `null` */
  @Input() linkCursor: StringAccessor<A>

  /** Area id accessor function corresponding to the feature id from TopoJSON. Default: `d => d.id ?? ''` */
  @Input() areaId: StringAccessor<A>

  /** Area color value or accessor function. Default: `d => d.color ?? null` */
  @Input() areaColor: ColorAccessor<A>

  /** Area cursor value or accessor function. Default: `null` */
  @Input() areaCursor: StringAccessor<A>

  /** Point color accessor. Default: `d => d.color ?? null` */
  @Input() pointColor: ColorAccessor<N>

  /** Point radius accessor. Default: `d => d.radius ?? 8` */
  @Input() pointRadius: NumericAccessor<N>

  /** Point stroke width accessor. Default: `d => d.strokeWidth ?? null` */
  @Input() pointStrokeWidth: NumericAccessor<N>

  /** Point cursor constant value or accessor function. Default: `null` */
  @Input() pointCursor: StringAccessor<A>

  /** Point longitude accessor function. Default: `d => d.longitude ?? null` */
  @Input() longitude: NumericAccessor<N>

  /** Point latitude accessor function. Default: `d => d.latitude ?? null` */
  @Input() latitude: NumericAccessor<N>

  /** Point label accessor function. Default: `undefined` */
  @Input() pointLabel: StringAccessor<N>

  /** Point color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  @Input() pointLabelTextBrightnessRatio: number

  /** Point id accessor function. Default: `d => d.id` */
  @Input() pointId: StringAccessor<N>

  /** Enables blur and blending between neighbouring points. Default: `false` */
  @Input() heatmapMode: boolean

  /** Heatmap blur filter stdDeviation value. Default: `10` */
  @Input() heatmapModeBlurStdDeviation: number

  /** Zoom level at which the heatmap mode will be disabled. Default: `2.5` */
  @Input() heatmapModeZoomLevelThreshold: number
  @Input() data: any

  component: TopoJSONMap<N, L, A> | undefined

  ngAfterViewInit (): void {
    this.component = new TopoJSONMap<N, L, A>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): TopoJSONMapConfigInterface<N, L, A> {
    const { duration, events, attributes, projection, topojson, mapFeatureName, mapFitToPoints, zoomFactor, disableZoom, zoomExtent, zoomDuration, linkWidth, linkColor, linkCursor, areaId, areaColor, areaCursor, pointColor, pointRadius, pointStrokeWidth, pointCursor, longitude, latitude, pointLabel, pointLabelTextBrightnessRatio, pointId, heatmapMode, heatmapModeBlurStdDeviation, heatmapModeZoomLevelThreshold } = this
    const config = { duration, events, attributes, projection, topojson, mapFeatureName, mapFitToPoints, zoomFactor, disableZoom, zoomExtent, zoomDuration, linkWidth, linkColor, linkCursor, areaId, areaColor, areaCursor, pointColor, pointRadius, pointStrokeWidth, pointCursor, longitude, latitude, pointLabel, pointLabelTextBrightnessRatio, pointId, heatmapMode, heatmapModeBlurStdDeviation, heatmapModeZoomLevelThreshold }
    const keys = Object.keys(config) as (keyof TopoJSONMapConfigInterface<N, L, A>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
