import { GeoProjection } from 'd3-geo'
import { ComponentConfigInterface, ComponentDefaultConfig } from 'core/component/config'

// Types
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

// Local Types
import { MapPointLabelPosition, TopoJSONMapPointShape, TopoJSONMapPointStyles } from './types'

export interface TopoJSONMapConfigInterface<
  AreaDatum,
  PointDatum = unknown,
  LinkDatum = unknown,
> extends ComponentConfigInterface {
  // General
  /** MapProjection (aka D3's GeoProjection) instance. Default: `MapProjection.Kavrayskiy7()` */
  projection?: GeoProjection;
  /** Map data in the TopoJSON topology format. Default: `undefined` */
  topojson?: TopoJSON.Topology;
  /** Name of the map features to be displayed, e.g. 'countries' or 'counties'. Default: `countries` */
  mapFeatureName?: string;
  /** Set initial map fit to points instead of topojson features. Default: `false` */
  mapFitToPoints?: boolean;
  /** Initial zoom level. Default: `undefined` */
  zoomFactor?: number;
  /** Disable pan / zoom interactions. Default: `false` */
  disableZoom?: boolean;
  /** Zoom extent. Default: `[0.5, 6]` */
  zoomExtent?: number[];
  /** Zoom animation duration. Default: `400` */
  zoomDuration?: number;

  /** Link width value or accessor function. Default: `d => d.width ?? 1` */
  linkWidth?: NumericAccessor<LinkDatum>;
  /** Link color value or accessor function. Default: `d => d.color ?? null` */
  linkColor?: ColorAccessor<LinkDatum>;
  /** Link cursor value or accessor function. Default: `null` */
  linkCursor?: StringAccessor<LinkDatum>;
  /** Link id accessor function. Default: `d => d.id` */
  linkId?: StringAccessor<LinkDatum>;
  /** Link source accessor function. Default: `d => d.source` */
  linkSource?: ((l: LinkDatum) => number | string | PointDatum);
  /** Link target accessor function. Default: `d => d.target` */
  linkTarget?: ((l: LinkDatum) => number | string | PointDatum);

  /** Area id accessor function corresponding to the feature id from TopoJSON. Default: `d => d.id ?? ''` */
  areaId?: StringAccessor<AreaDatum>;
  /** Area color value or accessor function. Default: `d => d.color ?? null` */
  areaColor?: ColorAccessor<AreaDatum>;
  /** Area cursor value or accessor function. Default: `null` */
  areaCursor?: StringAccessor<AreaDatum>;

  /** Point color accessor. Default: `d => d.color ?? null` */
  pointColor?: ColorAccessor<PointDatum>;
  /** Point radius accessor. Default: `d => d.radius ?? 8` */
  pointRadius?: NumericAccessor<PointDatum>;
  /** Point stroke width accessor. Default: `d => d.strokeWidth ?? null` */
  pointStrokeWidth?: NumericAccessor<PointDatum>;
  /** Point shape accessor. Default: `TopoJSONMapPointShape.Circle` */
  pointShape?: StringAccessor<PointDatum>;
  /** Point ring width for ring-shaped points. Default: `2` */
  pointRingWidth?: NumericAccessor<PointDatum>;
  /** Point cursor constant value or accessor function. Default: `null` */
  pointCursor?: StringAccessor<PointDatum>;
  /** Point longitude accessor function. Default: `d => d.longitude ?? null` */
  longitude?: NumericAccessor<PointDatum>;
  /** Point latitude accessor function. Default: `d => d.latitude ?? null` */
  latitude?: NumericAccessor<PointDatum>;
  /** Point label accessor function. Default: `undefined` */
  pointLabel?: StringAccessor<PointDatum>;
  /** Point label position. Default: `Position.Bottom` */
  pointLabelPosition?: MapPointLabelPosition;
  /** Point color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  pointLabelTextBrightnessRatio?: number;
  /** Point id accessor function. Default: `d => d.id` */
  pointId?: ((d: PointDatum, i: number) => string);

  /** Enables blur and blending between neighbouring points. Default: `false` */
  heatmapMode?: boolean;
  /** Heatmap blur filter stdDeviation value. Default: `10` */
  heatmapModeBlurStdDeviation?: number;
  /** Zoom level at which the heatmap mode will be disabled. Default: `2.5` */
  heatmapModeZoomLevelThreshold?: number;
}

export const TopoJSONMapDefaultConfig: TopoJSONMapConfigInterface<unknown, unknown, unknown> = {
  ...ComponentDefaultConfig,
  projection: undefined,
  duration: 1500,
  topojson: undefined,
  mapFeatureName: 'countries',
  mapFitToPoints: false,

  zoomExtent: [0.5, 6],
  zoomDuration: 400,
  disableZoom: false,
  zoomFactor: undefined,

  linkWidth: (d: unknown): number => (d as { width: number }).width ?? 1,
  linkColor: (d: unknown): string => (d as { color: string }).color ?? null,
  linkCursor: null,
  linkId: (d: unknown, i: number | undefined): string => `${(d as { id: string }).id ?? i}`,
  linkSource: (d: unknown): (number | string | unknown) => (d as { source: string }).source,
  linkTarget: (d: unknown): (number | string | unknown) => (d as { target: string }).target,

  areaId: (d: unknown): string => (d as { id: string }).id ?? '',
  areaColor: (d: unknown): string => (d as { color: string }).color ?? null,
  areaCursor: null,

  longitude: (d: unknown): number => (d as { longitude: number }).longitude,
  latitude: (d: unknown): number => (d as { latitude: number }).latitude,
  pointColor: (d: unknown): string => (d as { color: string }).color ?? null,
  pointRadius: (d: unknown): number => (d as { radius: number }).radius ?? 8,
  pointStrokeWidth: (d: unknown): number => (d as { strokeWidth: number }).strokeWidth ?? 0,
  pointShape: (): string => TopoJSONMapPointShape.Circle,
  pointRingWidth: (d: unknown): number => (d as { ringWidth: number }).ringWidth ?? 2,
  pointCursor: null,
  pointLabel: undefined,
  pointLabelPosition: MapPointLabelPosition.Bottom,
  pointLabelTextBrightnessRatio: 0.65,
  pointId: (d: unknown): string => (d as { id: string }).id,

  heatmapMode: false,
  heatmapModeBlurStdDeviation: 8,
  heatmapModeZoomLevelThreshold: 2.5,
}

