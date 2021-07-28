// Copyright (c) Volterra, Inc. All rights reserved.
import { geoMercator, geoEquirectangular } from 'd3-geo'

export enum ProjectionType {
  Mercator = 'mercator',
  Equirectangular = 'equirectangular',
}

export const Projection = {
  [ProjectionType.Mercator]: geoMercator,
  [ProjectionType.Equirectangular]: geoEquirectangular,
}

export interface MapInputNode {
  id?: string;
}

export interface MapInputLink {
  id?: string;
  source: number | string | MapInputNode;
  target: number | string | MapInputNode;
}

export type MapInputArea = {
  /** Area id related to the feature id in TopoJSON */
  id: string;
  color?: string;
}
