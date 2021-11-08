// Copyright (c) Volterra, Inc. All rights reserved.
import { LeafletFlowMapConfigInterface } from '@volterra/vis'
import { Style } from 'maplibre-gl'
import { HtmlVisStoryConfig } from '../../utils/html-content-wrapper'

// Configuration
import tilesConfig from '../leaflet-map/tiles-config.json'

// eslint-disable-next-line @typescript-eslint/ban-types
type MapPoint = {}
// eslint-disable-next-line @typescript-eslint/ban-types
type MapFlow = {}

export const baseConfig = (n = 25): HtmlVisStoryConfig & LeafletFlowMapConfigInterface<MapPoint, MapFlow> => ({
  data: [],
  rendererSettings: tilesConfig as Style,
})
