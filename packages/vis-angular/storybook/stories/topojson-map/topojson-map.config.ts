// Copyright (c) Volterra, Inc. All rights reserved.
import { TopoJSONMapConfigInterface } from '@volterra/vis'
import { SingleVisStoryConfig } from '../../utils/single-content-wrapper'

// eslint-disable-next-line @typescript-eslint/ban-types
type MapPoint = {}
type MapLink = {
  source: number;
  target: number;
}
// eslint-disable-next-line @typescript-eslint/ban-types
type MapArea = {}

export const baseConfig = (n = 25): SingleVisStoryConfig & TopoJSONMapConfigInterface<MapPoint, MapLink, MapArea> => ({
  data: { nodes: [], links: [] },
})
