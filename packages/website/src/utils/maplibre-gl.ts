import { getWorkerUrl, setWorkerUrl } from 'maplibre-gl/dist/maplibre-gl.mjs'

// Every `maplibre-gl` import on the site resolves to this module (see the MapLibre alias in docusaurus.config.js).
// MapLibre can't find its worker in a webpack bundle, and the worker URL that `@unovis/ts` inlines is a data URL webpack
// can't load. So we emit the worker together with the chunk it imports (see the MapLibre rule in docusaurus.config.js)
// and point MapLibre at it before any map is created. `LeafletMap` keeps a worker URL that is already set.
export * from 'maplibre-gl/dist/maplibre-gl.mjs'

const maplibreAssets = {
  worker: new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url),
  shared: new URL('maplibre-gl/dist/maplibre-gl-shared.mjs', import.meta.url),
}

if (!getWorkerUrl()) setWorkerUrl(maplibreAssets.worker.href)
