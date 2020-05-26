// Copyright (c) Volterra, Inc. All rights reserved.
import { geoMercator, geoEquirectangular } from 'd3-geo'

export enum ProjectionType {
  MERCATOR = 'mercator',
  EQUIRECTANGULAR = 'equirectangular',
}

export const Projection = {
  [ProjectionType.MERCATOR]: geoMercator,
  [ProjectionType.EQUIRECTANGULAR]: geoEquirectangular,
}
