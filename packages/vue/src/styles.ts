import { injectGlobal } from '@unovis/ts/styles/css'

injectGlobal(`
  [data-vis-bullet-legend],
  [data-vis-flow-legend],
  [data-vis-rolling-pin-legend] {
    display: block;
  }

  [data-vis-leaflet-flow-map],
  [data-vis-leaflet-map] {
    display: block;
    position: relative;
  }

  .unovis-single-container,
  .unovis-xy-container {
    display: block;
    position: relative;
    width: 100%;
  }
`)
