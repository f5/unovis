// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NodeDatumCore, LinkDatumCore } from 'types/graph'
import { NumericAccessor, StringAccessor, ColorAccessor } from 'types/misc'

// Local Types
import { ProjectionType, MapAreaCore } from './types'

export interface TopoJSONMapConfigInterface<N extends NodeDatumCore, L extends LinkDatumCore, A extends MapAreaCore> extends ComponentConfigInterface {
  // General
  /** Projection Type: 'mercator' or 'equirectangular'. Default: `ProjectionType.Mercator` */
  projection?: ProjectionType;
  /** Map data in the TopoJSON topology format */
  topojson?: /* TopoJSON.Topology */ any; // TopoJSON typings have troubles with being bundled so we're temporary disabling them
  /** Name of the map features to be displayed, e.g. 'countries' or 'counties'. Default: `countries` */
  mapFeatureName?: string;
  /** Set initial map fit to points instead of topojson features. Default: `false` */
  mapFitToPoints?: boolean;
  /** Initial zoom level. Default: `undefined` */
  zoomFactor?: number;
  /** Disable pan / zoom interactions */
  disableZoom?: boolean;
  /** Zoom extent. Default: `[1, 6]` */
  zoomExtent?: number[];
  /** Zoom animation duration. Default: `400` */
  zoomDuration?: number;

  /** Link width value or accessor function. Default: `d => d.width ?? 1` */
  linkWidth?: NumericAccessor<L>;
  /** Link color value or accessor function. Default: `d => d.color ?? null` */
  linkColor?: ColorAccessor<L>;
  /** Link cursor value or accessor function, Default: `null` */
  linkCursor?: StringAccessor<A>;
  /** Area id accessor function corresponding to the feature id from TopoJSON. Default: `d => d.id ?? ''` */
  areaId?: StringAccessor<A>;
  /** Area color value or accessor function. Default: `d => d.color ?? null` */
  areaColor?: ColorAccessor<A>;
  /** Area cursor value or accessor function, Default: `null` */
  areaCursor?: StringAccessor<A>;

  /** Point color accessor. Default: `d => d.color ?? null` */
  pointColor?: ColorAccessor<N>;
  /** Point radius accessor. Default: `d => d.radius ?? 8` */
  pointRadius?: NumericAccessor<N>;
  /** Point stroke width accessor. Default: `d => d.strokeWidth ?? null` */
  pointStrokeWidth?: NumericAccessor<N>;
  /** Point cursor value or accessor function, Default: `null` */
  pointCursor?: StringAccessor<A>;
  /** Point longitude accessor function. Default: `d => d.longitude ?? null` */
  longitude?: NumericAccessor<N>;
  /** Point latitude accessor function. Default: `d => d.latitude ?? null` */
  latitude?: NumericAccessor<N>;
  /** Point label accessor function. Default: `undefined` */
  pointLabel?: StringAccessor<N>;
  /** Point color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  pointLabelTextBrightnessRatio?: number;
  /** Point id accessor function. Default: `d => d.id` */
  pointId?: StringAccessor<N>;

  /** Enables blur and blending between neighbouring points. Default: `false` */
  heatmapMode?: boolean;
  /** Heatmap blur filter stdDeviation value. Default: `10` */
  heatmapModeBlurStdDeviation?: number;
  /** Zoom level at which the heatmap mode will be disabled. Default: `2.5` */
  heatmapModeZoomLevelThreshold?: number;
}

export class TopoJSONMapConfig<N extends NodeDatumCore, L extends LinkDatumCore, A extends MapAreaCore> extends ComponentConfig implements TopoJSONMapConfigInterface<N, L, A> {
  projection = ProjectionType.Mercator
  duration = 1500
  topojson = null
  mapFeatureName = 'countries'
  mapFitToPoints = false

  zoomExtent = [1, 6]
  zoomDuration = 400
  disableZoom = false
  zoomFactor = undefined

  linkWidth = (d: L): number => d['width'] ?? 1
  linkColor = (d: L): string => d['color'] ?? null
  linkCursor = null

  areaId = (d: A): string => d['id'] ?? ''
  areaColor = (d: A): string => d['color'] ?? null
  areaCursor = null

  longitude = (d: N): number => d['longitude']
  latitude = (d: N): number => d['latitude']
  pointColor = (d: N): string => d['color'] ?? null
  pointRadius = (d: N): number => d['radius'] ?? 8
  pointStrokeWidth = (d: N): number => d['strokeWidth'] ?? 0
  pointCursor = null
  pointLabel = undefined
  pointLabelTextBrightnessRatio = 0.65
  pointId = (d: N, i: number): string => `${d['id'] ?? i}`

  heatmapMode = false
  heatmapModeBlurStdDeviation = 8
  heatmapModeZoomLevelThreshold = 2.5
}
