// Minimal stub for `@maplibre/maplibre-gl-style-spec` used only by the Angular
// (TS 4.2 / Angular 12) build. The real package's `index.d.ts` uses inline
// `export { type X }` syntax that requires TypeScript 4.5+, which Angular 12's
// compiler-cli does not support. `@unovis/ts` only references these two types.
declare module '@maplibre/maplibre-gl-style-spec' {
  export type StyleSpecification = Record<string, unknown>
  export type LayerSpecification = Record<string, unknown>
}
