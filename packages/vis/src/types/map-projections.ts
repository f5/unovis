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
