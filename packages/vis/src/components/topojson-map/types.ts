// Copyright (c) Volterra, Inc. All rights reserved.
import {
  geoMercator,
  geoEquirectangular,
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoGnomonic,
  geoOrthographic,
  geoStereographic,
  geoEqualEarth,
  geoAlbersUsa,
  geoAlbers,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoTransverseMercator,
  geoNaturalEarth1,
} from 'd3-geo'

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

export enum MapProjectionKind {
  Mercator = 'Mercator',
  Equirectangular = 'Equirectangular',
  AzimuthalEqualArea = 'AzimuthalEqualArea',
  AzimuthalEquidistant = 'AzimuthalEquidistant',
  Gnomonic = 'Gnomonic',
  Orthographic = 'Orthographic',
  Stereographic = 'Stereographic',
  EqualEarth = 'EqualEarth',
  AlbersUsa = 'AlbersUsa',
  Albers = 'Albers',
  ConicConformal = 'ConicConformal',
  ConicEqualArea = 'ConicEqualArea',
  ConicEquidistant = 'ConicEquidistant',
  TransverseMercator = 'TransverseMercator',
  NaturalEarth1 = 'NaturalEarth1',
}

export const MapProjection = {
  [MapProjectionKind.Mercator]: geoMercator,
  [MapProjectionKind.Equirectangular]: geoEquirectangular,
  [MapProjectionKind.AzimuthalEqualArea]: geoAzimuthalEqualArea,
  [MapProjectionKind.AzimuthalEquidistant]: geoAzimuthalEquidistant,
  [MapProjectionKind.Gnomonic]: geoGnomonic,
  [MapProjectionKind.Orthographic]: geoOrthographic,
  [MapProjectionKind.Stereographic]: geoStereographic,
  [MapProjectionKind.EqualEarth]: geoEqualEarth,
  [MapProjectionKind.AlbersUsa]: geoAlbersUsa,
  [MapProjectionKind.Albers]: geoAlbers,
  [MapProjectionKind.ConicConformal]: geoConicConformal,
  [MapProjectionKind.ConicEqualArea]: geoConicEqualArea,
  [MapProjectionKind.ConicEquidistant]: geoConicEquidistant,
  [MapProjectionKind.TransverseMercator]: geoTransverseMercator,
  [MapProjectionKind.NaturalEarth1]: geoNaturalEarth1,
}
