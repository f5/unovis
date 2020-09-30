// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NodeDatumCore, LinkDatumCore } from 'types/graph'
import { NumericAccessor, StringAccessor, ColorAccessor } from 'types/misc'
import { ProjectionType } from 'types/map-projections'
import { MapAreaCore } from './modules/types'

export interface TopoJSONMapConfigInterface<N extends NodeDatumCore, L extends LinkDatumCore, A extends MapAreaCore> extends ComponentConfigInterface {
  /** Projection Type: 'mercator' or 'equirectangular' */
  projection?: ProjectionType;
  /** Map data in the TopoJSON topology format */
  topojson?: /* TopoJSON.Topology */ any; // TopoJSON typings have troubles with being bundled so we're temporary disabling them
  /** Name of the map features to be displayed, e.g. 'countries' or 'counties' */
  mapFeatureName?: string;
  /** Set initial map fit to points instead of topojson features */
  mapFitToPoints?: boolean;
  /** Initial zoom level */
  zoomFactor?: number;
  /** Disable pan / zoom interactions */
  disableZoom?: boolean;
  /** Zoom extent. Default: `[1, 6]` */
  zoomExtent?: number[];
  /** Link width accessor */
  linkWidth?: NumericAccessor<L>;
  /** Link color accessor */
  linkColor?: ColorAccessor<L>;
  /** Area id accessor corresponding to the feature id from TopoJSON */
  areaId?: StringAccessor<A>;
  /** Area color accessor */
  areaColor?: ColorAccessor<A>;
  /** Point color accessor */
  pointColor?: ColorAccessor<N>;
  /** Point radius accessor */
  pointRadius?: NumericAccessor<N>;
  /** Point stroke width accessor */
  pointStrokeWidth?: NumericAccessor<N>;
  /** Point longitude accessor */
  longitude?: NumericAccessor<N>;
  /** Point latitude accessor */
  latitude?: NumericAccessor<N>;
  /** Point label accessor. Default: `undefined` */
  pointLabel?: StringAccessor<N>;
  /** Point color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  pointLabelTextBrightnessRatio?: number;
}

export class TopoJSONMapConfig<N extends NodeDatumCore, L extends LinkDatumCore, A extends MapAreaCore> extends ComponentConfig implements TopoJSONMapConfigInterface<N, L, A> {
  projection = ProjectionType.MERCATOR
  duration = 1500
  topojson = null
  mapFeatureName = 'countries'
  mapFitToPoints = false

  zoomExtent = [1, 6]
  disableZoom = false
  zoomFactor = undefined

  linkWidth = (d: L): number => d['width'] ?? 1
  linkColor = (d: L): string => d['color'] ?? null
  areaId = (d: A): string => d['id'] ?? ''
  areaColor = (d: A): string => d['color'] ?? null
  pointColor = (d: N): string => d['color'] ?? null
  pointRadius = (d: N): number => d['radius'] ?? 8
  pointStrokeWidth = (d: N): number => d['strokeWidth'] ?? 0
  longitude = (d: N): number => d['longitude']
  latitude = (d: N): number => d['latitude']
  pointLabel = undefined
  pointLabelTextBrightnessRatio = 0.65
}
