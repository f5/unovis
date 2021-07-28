// Copyright (c) Volterra, Inc. All rights reserved.

// Utils
import { merge } from 'utils/data'

// Local Types
import { LeafletMapRenderer } from '../types'

// Config
import { LeafletMapConfigInterface } from '../config'

import baseTangramSettings from './tangram/tangram-settings.json'
// import tangramDarkTheme from './tangram/tangram-dark-theme'
import tangramLightTheme from './tangram/tangram-light-theme.json'

import baseMapboxglSettings from './mapboxgl/mapboxgl-settings.json'
// import mapboxglDarkTheme from './mapboxgl/mapboxgl-dark-theme.json'
import mapboxglLightTheme from './mapboxgl/mapboxgl-light-theme.json'

export function getRendererSettings<T> (config: LeafletMapConfigInterface<T>): any {
  const { renderer, sources, mapboxglGlyphs, rendererSettings } = config
  let settings: any
  switch (typeof rendererSettings) {
    case 'object':
    case 'string':
      settings = rendererSettings
      break
    default: {
      const baseSettings = renderer === LeafletMapRenderer.Tangram ? baseTangramSettings : baseMapboxglSettings
      // const dark = renderer === MapRenderer.Tangram ? tangramDarkTheme : mapboxglDarkTheme
      const light = renderer === LeafletMapRenderer.Tangram ? tangramLightTheme : mapboxglLightTheme
      settings = merge(baseSettings, light)
      break
    }
  }

  if (sources) settings.sources = sources
  if (mapboxglGlyphs) settings.glyphs = mapboxglGlyphs

  return settings
}
