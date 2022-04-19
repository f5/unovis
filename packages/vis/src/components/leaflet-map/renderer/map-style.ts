import { StyleSpecification, LayerSpecification } from 'maplibre-gl'

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

export type MapLibreStyleSpecs = StyleSpecification

export const TangramArcticDark: TangramScene = {
  ...(tangramBaseSettings as TangramScene),
  layers: {
    ...tangramBaseSettings.layers,
    ...tangramDarkTheme.layers,
  },
}

export const TangramArcticLight: TangramScene = {
  ...(tangramBaseSettings as TangramScene),
  layers: {
    ...tangramBaseSettings.layers,
    ...tangramLightTheme.layers,
  },
}

export const MapLibreArcticDark: MapLibreStyleSpecs = {
  ...(mapLibreBaseSettings as StyleSpecification),
  layers: [
    ...mapLibreDarkTheme.layers,
    ...mapLibreBaseSettings.layers,
  ] as Array<LayerSpecification>,
}

export const MapLibreArcticLight: MapLibreStyleSpecs = {
  ...(mapLibreBaseSettings as StyleSpecification),
  layers: [
    ...mapLibreLightTheme.layers,
    ...mapLibreBaseSettings.layers,
  ] as Array<LayerSpecification>,
}
