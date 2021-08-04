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

export enum MapProjectionType {
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
  [MapProjectionType.Mercator]: geoMercator,
  [MapProjectionType.Equirectangular]: geoEquirectangular,
  [MapProjectionType.AzimuthalEqualArea]: geoAzimuthalEqualArea,
  [MapProjectionType.AzimuthalEquidistant]: geoAzimuthalEquidistant,
  [MapProjectionType.Gnomonic]: geoGnomonic,
  [MapProjectionType.Orthographic]: geoOrthographic,
  [MapProjectionType.Stereographic]: geoStereographic,
  [MapProjectionType.EqualEarth]: geoEqualEarth,
  [MapProjectionType.AlbersUsa]: geoAlbersUsa,
  [MapProjectionType.Albers]: geoAlbers,
  [MapProjectionType.ConicConformal]: geoConicConformal,
  [MapProjectionType.ConicEqualArea]: geoConicEqualArea,
  [MapProjectionType.ConicEquidistant]: geoConicEquidistant,
  [MapProjectionType.TransverseMercator]: geoTransverseMercator,
  [MapProjectionType.NaturalEarth1]: geoNaturalEarth1,
}
