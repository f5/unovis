// Copyright (c) Volterra, Inc. All rights reserved.
import { Style } from 'maplibre-gl'
import { merge } from 'utils/data'

import tangramBaseSettings from './tangram/tangram-settings.json'
import tangramDarkTheme from './tangram/tangram-dark-theme.json'
import tangramLightTheme from './tangram/tangram-light-theme.json'

import mapLibreBaseSettings from './mapboxgl/mapboxgl-settings.json'
import mapLibreDarkTheme from './mapboxgl/mapboxgl-dark-theme.json'
import mapLibreLightTheme from './mapboxgl/mapboxgl-light-theme.json'

/** See {@link https://tangrams.readthedocs.io/en/master/Overviews/Scene-File/} */
export type TangramScene = {
  [key in ('cameras' | 'layers' | 'sources' | 'global' | 'import' | 'lights' | 'scene' | 'styles' | 'textures')]: any;
}
export const TangramArcticDark: TangramScene = merge(tangramBaseSettings, tangramDarkTheme)
export const TangramArcticLight: TangramScene = merge(tangramBaseSettings, tangramLightTheme)

export const MapLibreArcticDark: Style = merge(mapLibreBaseSettings, mapLibreDarkTheme)
export const MapLibreArcticLight: Style = merge(mapLibreBaseSettings, mapLibreLightTheme)
