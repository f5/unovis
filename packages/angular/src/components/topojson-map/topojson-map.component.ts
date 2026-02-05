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
  TopoJSONMapClusterDatum,
  TopoJSONMapPointStyles,
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

  /** Flow source point longitude accessor function or value. Default: `f => f.sourceLongitude` */
  @Input() sourceLongitude?: NumericAccessor<LinkDatum>

  /** Flow source point latitude accessor function or value. Default: `f => f.sourceLatitude` */
  @Input() sourceLatitude?: NumericAccessor<LinkDatum>

  /** Flow target point longitude accessor function or value. Default: `f => f.targetLongitude` */
  @Input() targetLongitude?: NumericAccessor<LinkDatum>

  /** Flow target point latitude accessor function or value. Default: `f => f.targetLatitude` */
  @Input() targetLatitude?: NumericAccessor<LinkDatum>

  /** Flow source point radius accessor function or value. Default: `3` */
  @Input() sourcePointRadius?: NumericAccessor<LinkDatum>

  /** Source point color accessor function or value. Default: `'#88919f'` */
  @Input() sourcePointColor?: ColorAccessor<LinkDatum>

  /** Flow particle color accessor function or value. Default: `'#949dad'` */
  @Input() flowParticleColor?: ColorAccessor<LinkDatum>

  /** Flow particle radius accessor function or value. Default: `1.1` */
  @Input() flowParticleRadius?: NumericAccessor<LinkDatum>

  /** Flow particle speed accessor function or value. The unit is arbitrary, recommended range is 0 – 0.2. Default: `0.07` */
  @Input() flowParticleSpeed?: NumericAccessor<LinkDatum>

  /** Flow particle density accessor function or value on the range of [0, 1]. Default: `0.6` */
  @Input() flowParticleDensity?: NumericAccessor<LinkDatum>

  /** Enable flow animations. When true, shows animated particles along links. Default: `false` */
  @Input() enableFlowAnimation?: boolean

  /** Flow source point click callback function. Default: `undefined` */
  @Input() onSourcePointClick?: (f: LinkDatum, x: number, y: number, event: MouseEvent) => void

  /** Flow source point mouse over callback function. Default: `undefined` */
  @Input() onSourcePointMouseEnter?: (f: LinkDatum, x: number, y: number, event: MouseEvent) => void

  /** Flow source point mouse leave callback function. Default: `undefined` */
  @Input() onSourcePointMouseLeave?: (f: LinkDatum, event: MouseEvent) => void

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

  /** Point inner label accessor function. Default: `undefined` */
  @Input() pointLabel?: StringAccessor<PointDatum>

  /** Point inner label color accessor function or constant value.
   * By default, the label color will be set, depending on the point brightness, either to
   * `--vis-map-point-label-text-color-dark` or to `--vis-map-point-label-text-color-light` CSS variable.
   * Default: `undefined` */
  @Input() pointLabelColor?: ColorAccessor<PointDatum>

  /** Point label position. Default: `MapPointLabelPosition.Center` */
  @Input() pointLabelPosition?: MapPointLabelPosition

  /** Point bottom label accessor function. Default: `undefined` */
  @Input() pointBottomLabel?: StringAccessor<PointDatum>

  /** Point color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  @Input() pointLabelTextBrightnessRatio?: number

  /** Point id accessor function. Default: `d => d.id` */
  @Input() pointId?: ((d: PointDatum, i: number) => string)

  /** Cluster color accessor function or constant value. Default: `undefined` */
  @Input() clusterColor?: ColorAccessor<TopoJSONMapClusterDatum<PointDatum>>

  /** Cluster radius accessor function or constant value. Default: `undefined` */
  @Input() clusterRadius?: NumericAccessor<TopoJSONMapClusterDatum<PointDatum>>

  /** Cluster inner label accessor function. Default: `d => d.pointCount` */
  @Input() clusterLabel?: StringAccessor<TopoJSONMapClusterDatum<PointDatum>>

  /** Cluster inner label color accessor function or constant value. Default: `undefined` */
  @Input() clusterLabelColor?: StringAccessor<TopoJSONMapClusterDatum<PointDatum>>

  /** Cluster bottom label accessor function. Default: `''` */
  @Input() clusterBottomLabel?: StringAccessor<TopoJSONMapClusterDatum<PointDatum>>

  /** The width of the cluster point ring. Default: `2` */
  @Input() clusterRingWidth?: number

  /** When cluster is expanded, show a background circle to better separate points from the base map. Default: `true` */
  @Input() clusterBackground?: boolean

  /** Defines whether the cluster should expand on click or not. Default: `true` */
  @Input() clusterExpandOnClick?: boolean

  /** Clustering distance in pixels. Default: `55` */
  @Input() clusteringDistance?: number

  /** Enable point clustering. Default: `false` */
  @Input() clustering?: boolean

  /** Enables blur and blending between neighbouring points. Default: `false` */
  @Input() heatmapMode?: boolean

  /** Heatmap blur filter stdDeviation value. Default: `10` */
  @Input() heatmapModeBlurStdDeviation?: number

  /** Zoom level at which the heatmap mode will be disabled. Default: `2.5` */
  @Input() heatmapModeZoomLevelThreshold?: number

  /** A single map point can have multiple properties displayed as a small pie chart.
   * By setting the colorMap configuration you can specify data properties that should be mapped to various pie / donut segments.
   *
   * ```
   * {
   *  [key in keyof PointDatum]?: { color: string, className?: string }
   * }
   * ```
   * e.g.:
   * ```
   * {
   *  healthy: { color: 'green' },
   *  warning: { color: 'orange' },
   *  critical: { color: 'red' }
   * }
   * ```
   * where every data point has the `healthy`, `warning` and `critical` numerical or boolean property.
   * Note: Properties with 0 or falsy values will not be displayed in the pie chart.
   * Default: `{}` */
  @Input() colorMap?: TopoJSONMapPointStyles<PointDatum>
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
    const { duration, events, attributes, projection, topojson, mapFeatureName, mapFitToPoints, zoomFactor, disableZoom, zoomExtent, zoomDuration, linkWidth, linkColor, linkCursor, linkId, linkSource, linkTarget, sourceLongitude, sourceLatitude, targetLongitude, targetLatitude, sourcePointRadius, sourcePointColor, flowParticleColor, flowParticleRadius, flowParticleSpeed, flowParticleDensity, enableFlowAnimation, onSourcePointClick, onSourcePointMouseEnter, onSourcePointMouseLeave, areaId, areaColor, areaCursor, areaLabel, pointColor, pointRadius, pointStrokeWidth, pointShape, pointRingWidth, pointCursor, longitude, latitude, pointLabel, pointLabelColor, pointLabelPosition, pointBottomLabel, pointLabelTextBrightnessRatio, pointId, clusterColor, clusterRadius, clusterLabel, clusterLabelColor, clusterBottomLabel, clusterRingWidth, clusterBackground, clusterExpandOnClick, clusteringDistance, clustering, heatmapMode, heatmapModeBlurStdDeviation, heatmapModeZoomLevelThreshold, colorMap } = this
    const config = { duration, events, attributes, projection, topojson, mapFeatureName, mapFitToPoints, zoomFactor, disableZoom, zoomExtent, zoomDuration, linkWidth, linkColor, linkCursor, linkId, linkSource, linkTarget, sourceLongitude, sourceLatitude, targetLongitude, targetLatitude, sourcePointRadius, sourcePointColor, flowParticleColor, flowParticleRadius, flowParticleSpeed, flowParticleDensity, enableFlowAnimation, onSourcePointClick, onSourcePointMouseEnter, onSourcePointMouseLeave, areaId, areaColor, areaCursor, areaLabel, pointColor, pointRadius, pointStrokeWidth, pointShape, pointRingWidth, pointCursor, longitude, latitude, pointLabel, pointLabelColor, pointLabelPosition, pointBottomLabel, pointLabelTextBrightnessRatio, pointId, clusterColor, clusterRadius, clusterLabel, clusterLabelColor, clusterBottomLabel, clusterRingWidth, clusterBackground, clusterExpandOnClick, clusteringDistance, clustering, heatmapMode, heatmapModeBlurStdDeviation, heatmapModeZoomLevelThreshold, colorMap }
    const keys = Object.keys(config) as (keyof TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
