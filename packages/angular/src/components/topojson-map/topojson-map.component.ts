// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  TopoJSONMap,
  TopoJSONMapConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  StringAccessor,
  MapPointLabelPosition,
} from '@unovis/ts'
import { GeoProjection } from 'd3-geo'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-topojson-map',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisTopoJSONMapComponent }],
})
export class VisTopoJSONMapComponent<AreaDatum, PointDatum, LinkDatum> implements TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>, AfterViewInit {
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

  /** MapProjection (aka D3's GeoProjection) instance. Default: `MapProjection.Kavrayskiy7()` */
  @Input() projection?: GeoProjection

  /** Map data in the TopoJSON topology format. Default: `undefined` */
  @Input() topojson?: TopoJSON.Topology

  /** Name of the map features to be displayed, e.g. 'countries' or 'counties'. Default: `countries` */
  @Input() mapFeatureName?: string

  /** Set initial map fit to points instead of topojson features. Default: `false` */
  @Input() mapFitToPoints?: boolean

  /** Initial zoom level. Default: `undefined` */
  @Input() zoomFactor?: number

  /** Disable pan / zoom interactions. Default: `false` */
  @Input() disableZoom?: boolean

  /** Zoom extent. Default: `[0.5, 6]` */
  @Input() zoomExtent?: number[]

  /** Zoom animation duration. Default: `400` */
  @Input() zoomDuration?: number

  /** Link width value or accessor function. Default: `d => d.width ?? 1` */
  @Input() linkWidth?: NumericAccessor<LinkDatum>

  /** Link color value or accessor function. Default: `d => d.color ?? null` */
  @Input() linkColor?: ColorAccessor<LinkDatum>

  /** Link cursor value or accessor function. Default: `null` */
  @Input() linkCursor?: StringAccessor<LinkDatum>

  /** Link id accessor function. Default: `d => d.id` */
  @Input() linkId?: StringAccessor<LinkDatum>

  /** Link source accessor function. Default: `d => d.source` */
  @Input() linkSource?: ((l: LinkDatum) => number | string | PointDatum)

  /** Link target accessor function. Default: `d => d.target` */
  @Input() linkTarget?: ((l: LinkDatum) => number | string | PointDatum)

  /** Area id accessor function corresponding to the feature id from TopoJSON. Default: `d => d.id ?? ''` */
  @Input() areaId?: StringAccessor<AreaDatum>

  /** Area color value or accessor function. Default: `d => d.color ?? null` */
  @Input() areaColor?: ColorAccessor<AreaDatum>

  /** Area cursor value or accessor function. Default: `null` */
  @Input() areaCursor?: StringAccessor<AreaDatum>

  /** Area label accessor function. Default: `undefined` */
  @Input() areaLabel?: StringAccessor<AreaDatum>

  /** Point color accessor. Default: `d => d.color ?? null` */
  @Input() pointColor?: ColorAccessor<PointDatum>

  /** Point radius accessor. Default: `d => d.radius ?? 8` */
  @Input() pointRadius?: NumericAccessor<PointDatum>

  /** Point stroke width accessor. Default: `d => d.strokeWidth ?? null` */
  @Input() pointStrokeWidth?: NumericAccessor<PointDatum>

  /** Point shape accessor. Default: `TopoJSONMapPointShape.Circle` */
  @Input() pointShape?: StringAccessor<PointDatum>

  /** Point ring width for ring-shaped points. Default: `2` */
  @Input() pointRingWidth?: NumericAccessor<PointDatum>

  /** Point cursor constant value or accessor function. Default: `null` */
  @Input() pointCursor?: StringAccessor<PointDatum>

  /** Point longitude accessor function. Default: `d => d.longitude ?? null` */
  @Input() longitude?: NumericAccessor<PointDatum>

  /** Point latitude accessor function. Default: `d => d.latitude ?? null` */
  @Input() latitude?: NumericAccessor<PointDatum>

  /** Point label accessor function. Default: `undefined` */
  @Input() pointLabel?: StringAccessor<PointDatum>

  /** Point label position. Default: `Position.Bottom` */
  @Input() pointLabelPosition?: MapPointLabelPosition

  /** Point color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  @Input() pointLabelTextBrightnessRatio?: number

  /** Point id accessor function. Default: `d => d.id` */
  @Input() pointId?: ((d: PointDatum, i: number) => string)

  /** Enables blur and blending between neighbouring points. Default: `false` */
  @Input() heatmapMode?: boolean

  /** Heatmap blur filter stdDeviation value. Default: `10` */
  @Input() heatmapModeBlurStdDeviation?: number

  /** Zoom level at which the heatmap mode will be disabled. Default: `2.5` */
  @Input() heatmapModeZoomLevelThreshold?: number
  @Input() data: {areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]}

  component: TopoJSONMap<AreaDatum, PointDatum, LinkDatum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>(this.getConfig())

    if (this.data) {
      this.component.setData(this.data)
      this.componentContainer?.render()
    }
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
    this.componentContainer?.render()
  }

  private getConfig (): TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum> {
    const { duration, events, attributes, projection, topojson, mapFeatureName, mapFitToPoints, zoomFactor, disableZoom, zoomExtent, zoomDuration, linkWidth, linkColor, linkCursor, linkId, linkSource, linkTarget, areaId, areaColor, areaCursor, areaLabel, pointColor, pointRadius, pointStrokeWidth, pointShape, pointRingWidth, pointCursor, longitude, latitude, pointLabel, pointLabelPosition, pointLabelTextBrightnessRatio, pointId, heatmapMode, heatmapModeBlurStdDeviation, heatmapModeZoomLevelThreshold } = this
    const config = { duration, events, attributes, projection, topojson, mapFeatureName, mapFitToPoints, zoomFactor, disableZoom, zoomExtent, zoomDuration, linkWidth, linkColor, linkCursor, linkId, linkSource, linkTarget, areaId, areaColor, areaCursor, areaLabel, pointColor, pointRadius, pointStrokeWidth, pointShape, pointRingWidth, pointCursor, longitude, latitude, pointLabel, pointLabelPosition, pointLabelTextBrightnessRatio, pointId, heatmapMode, heatmapModeBlurStdDeviation, heatmapModeZoomLevelThreshold }
    const keys = Object.keys(config) as (keyof TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
