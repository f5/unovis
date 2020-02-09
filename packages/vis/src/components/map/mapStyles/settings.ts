// Copyright (c) Volterra, Inc. All rights reserved.

// Utils
import { merge } from 'utils/data'

// Types
import { MapRenderer } from 'types/map'

import tangramSettings from './tangram/tangram-settings.json'
// import tangramDarkTheme from './tangram/tangram-dark-theme'
import tangramLightTheme from './tangram/tangram-light-theme.json'

import defaultMapboxglStyle from './mapboxgl/mapboxgl-style.json'
// import mapboxglDarkTheme from './mapboxgl/mapboxgl-dark-theme.json'
import mapboxglLightTheme from './mapboxgl/mapboxgl-light-theme.json'

export function getRendererSettings (config) {
  const { renderer, sources, rendererSettings } = config
  let settings: any
  switch (typeof rendererSettings) {
  case 'object':
  case 'string':
    settings = rendererSettings
    break
  default: {
    const defaultSettings = renderer === MapRenderer.TANGRAM ? tangramSettings : defaultMapboxglStyle
    // const dark = renderer === MapRenderer.TANGRAM ? tangramDarkTheme : mapboxglDarkTheme
    const light = renderer === MapRenderer.TANGRAM ? tangramLightTheme : mapboxglLightTheme
    settings = merge(defaultSettings, light)
    break
  }
  }

  if (sources) settings.sources = sources

  return settings
}
