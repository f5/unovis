/* eslint-disable dot-notation */
import { GeoProjection } from 'd3-geo'
import { ComponentConfigInterface, ComponentDefaultConfig } from 'core/component/config'

// Types
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

// Local Types
import { MapProjection, MapPointLabelPosition } from './types'

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
  projection: MapProjection.Kavrayskiy7(),
  duration: 1500,
  topojson: undefined,
  mapFeatureName: 'countries',
  mapFitToPoints: false,

  zoomExtent: [0.5, 6],
  zoomDuration: 400,
  disableZoom: false,
  zoomFactor: undefined,

  linkWidth: <LinkDatum>(d: LinkDatum): number => d['width'] ?? 1,
  linkColor: <LinkDatum>(d: LinkDatum): string => d['color'] ?? null,
  linkCursor: null,
  linkId: <LinkDatum>(d: LinkDatum, i: number | undefined): string => `${d['id'] ?? i}`,
  linkSource: <LinkDatum>(d: LinkDatum): (number | string | unknown) => d['source'],
  linkTarget: <LinkDatum>(d: LinkDatum): (number | string | unknown) => d['target'],

  areaId: <AreaDatum>(d: AreaDatum): string => d['id'] ?? '',
  areaColor: <AreaDatum>(d: AreaDatum): string => d['color'] ?? null,
  areaCursor: null,

  longitude: <PointDatum>(d: PointDatum): number => d['longitude'],
  latitude: <PointDatum>(d: PointDatum): number => d['latitude'],
  pointColor: <PointDatum>(d: PointDatum): string => d['color'] ?? null,
  pointRadius: <PointDatum>(d: PointDatum): number => d['radius'] ?? 8,
  pointStrokeWidth: <PointDatum>(d: PointDatum): number => d['strokeWidth'] ?? 0,
  pointCursor: null,
  pointLabel: undefined,
  pointLabelPosition: MapPointLabelPosition.Bottom,
  pointLabelTextBrightnessRatio: 0.65,
  pointId: <PointDatum>(d: PointDatum): string => d['id'],

  heatmapMode: false,
  heatmapModeBlurStdDeviation: 8,
  heatmapModeZoomLevelThreshold: 2.5,
}

