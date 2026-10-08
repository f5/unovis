declare module '*.css';
declare module '*.css?inline' {
  const css: string
  export default css
}
// Provided by `rollup-plugin-maplibre-worker-source.js`
declare module 'virtual:maplibre-worker-source' {
  const source: string
  export default source
  /** Version of maplibre-gl the worker was built from */
  export const version: string
}
declare module 'd3-geo-projection'
declare module 'd3-interpolate-path'
