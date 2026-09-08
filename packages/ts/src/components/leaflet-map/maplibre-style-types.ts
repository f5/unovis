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
