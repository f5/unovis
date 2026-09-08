import mapLibreBaseSettings from './mapboxgl/mapboxgl-settings.json'
import mapLibreDarkTheme from './mapboxgl/mapboxgl-dark-theme.json'
import mapLibreLightTheme from './mapboxgl/mapboxgl-light-theme.json'

// Local, TypeScript 4.2-parseable aliases for the MapLibre style types. Importing them directly from
// `@maplibre/maplibre-gl-style-spec` breaks the build because that package's `.d.ts` uses inline
// `export { type ... }` syntax that requires TypeScript >= 4.5.
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
