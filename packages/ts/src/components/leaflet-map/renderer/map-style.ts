import mapLibreBaseSettings from './mapboxgl/mapboxgl-settings.json'
import mapLibreDarkTheme from './mapboxgl/mapboxgl-dark-theme.json'
import mapLibreLightTheme from './mapboxgl/mapboxgl-light-theme.json'

export type LayerSpecification = Record<string, unknown>
export interface StyleSpecification {
  layers: LayerSpecification[];
  sources?: Record<string, unknown>;
  glyphs?: string;
  [key: string]: unknown;
}


export type MapLibreStyleSpecs = StyleSpecification

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
