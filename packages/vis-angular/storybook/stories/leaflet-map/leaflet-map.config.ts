// Copyright (c) Volterra, Inc. All rights reserved.
import { LeafletMapConfigInterface } from '@volterra/vis'
import { Style } from 'maplibre-gl'
import { HtmlVisStoryConfig } from '../../utils/html-content-wrapper'

// Configuration
import tilesConfig from './tiles-config.json'

// eslint-disable-next-line @typescript-eslint/ban-types
type MapPoint = {}

export const baseConfig = (n = 25): HtmlVisStoryConfig & LeafletMapConfigInterface<MapPoint> => ({
  data: [],
  rendererSettings: tilesConfig as Style,
})
