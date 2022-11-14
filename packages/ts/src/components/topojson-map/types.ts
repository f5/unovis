import { Feature, Geometry } from 'geojson'
import {
  GeoProjection,
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

import {
  geoBromley,
  geoNaturalEarth2,
  geoKavrayskiy7,
  geoHufnagel,
  geoFoucautSinusoidal,
  geoFahey,
  geoEckert1,
  geoEckert3,
  geoBoggs,
  geoCylindricalStereographic,
  geoCraster,
  geoBaker,
  geoArmadillo,
  geoAitoff,
  geoRobinson,
} from 'd3-geo-projection'

export type MapData<AreaDatum, PointDatum = unknown, LinkDatum = unknown> = {
  areas?: AreaDatum[];
  points?: PointDatum[];
  links?: LinkDatum[] ;
}

export enum MapPointLabelPosition {
  Center = 'center',
  Bottom = 'bottom',
}

export type MapFeature<D> = Feature<Geometry> & { data: D }

export enum MapProjectionKind {
  // Projections form `d3-geo`
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

  // Projections form `d3-geo-projection`
  Bromley = 'Bromley',
  NaturalEarth2 = 'NaturalEarth2',
  Kavrayskiy7 = 'Kavrayskiy7',
  Hufnagel = 'Hufnagel',
  FoucautSinusoidal = 'FoucautSinusoidal',
  Eckert1 = 'Eckert1',
  Eckert3 = 'Eckert3',
  Boggs = 'Boggs',
  CylindricalStereographic = 'CylindricalStereographic',
  Craster = 'Craster',
  Baker = 'Baker',
  Armadillo = 'Armadillo',
  Aitoff = 'Aitoff',
  Fahey = 'Fahey',
  Robinson = 'Robinson',
}

export const MapProjection = {
  // Projections form `d3-geo`
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

  // Projections form `d3-geo-projection`
  [MapProjectionKind.Bromley]: geoBromley as () => GeoProjection,
  [MapProjectionKind.NaturalEarth2]: geoNaturalEarth2 as () => GeoProjection,
  [MapProjectionKind.Kavrayskiy7]: geoKavrayskiy7 as () => GeoProjection,
  [MapProjectionKind.Hufnagel]: geoHufnagel as () => GeoProjection,
  [MapProjectionKind.FoucautSinusoidal]: geoFoucautSinusoidal as () => GeoProjection,
  [MapProjectionKind.Eckert1]: geoEckert1 as () => GeoProjection,
  [MapProjectionKind.Eckert3]: geoEckert3 as () => GeoProjection,
  [MapProjectionKind.Boggs]: geoBoggs as () => GeoProjection,
  [MapProjectionKind.CylindricalStereographic]: geoCylindricalStereographic as () => GeoProjection,
  [MapProjectionKind.Craster]: geoCraster as () => GeoProjection,
  [MapProjectionKind.Baker]: geoBaker as () => GeoProjection,
  [MapProjectionKind.Armadillo]: geoArmadillo as () => GeoProjection,
  [MapProjectionKind.Aitoff]: geoAitoff as () => GeoProjection,
  [MapProjectionKind.Fahey]: geoFahey as () => GeoProjection,
  [MapProjectionKind.Robinson]: geoRobinson as () => GeoProjection,
}

