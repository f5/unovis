import React, { ForwardedRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { Layer, LeafletEvent, Map as LeafletMap } from 'leaflet'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { isFunction } from '@unovis/ts'

import * as Original from '../../../react/src'
import type { VisLeafletMapProps, VisLeafletMapRef } from '../../../react/src/html-components/leaflet-map'
import type { GenericDataRecord } from '../../../ts/src/types/data'

type MapLayer = Layer & { isLoading?: () => boolean; getMaplibreMap?: () => MapLibreMap }
type LayerObserver = { ready: () => boolean; cleanup: () => void }

function observeMap (map: LeafletMap, status: HTMLSpanElement): () => void {
  const layers = new Map<Layer, LayerObserver>()
  let moving = false
  let zooming = false

  const setBusy = (busy: boolean, pending = 'Waiting for Leaflet movement'): void => {
    const value = String(busy)
    if (status.getAttribute('aria-busy') !== value) status.setAttribute('aria-busy', value)
    if (busy && status.dataset.capturePending !== pending) status.dataset.capturePending = pending
  }
  const check = (): void => {
    const pending = Array.from(layers.values()).some(layer => !layer.ready())
    setBusy(moving || zooming || pending, pending ? 'Waiting for Leaflet tiles or MapLibre rendering' : undefined)
  }
  const fail = (message: string): void => {
    status.dataset.captureError ??= message
    setBusy(true)
  }
  const addLayer = (layer: MapLayer): void => {
    if (layers.has(layer)) return
    const gl = isFunction(layer.getMaplibreMap) ? layer.getMaplibreMap() : undefined
    if (gl) {
      let idle = gl.loaded() && !gl.isMoving()
      const loading = (): void => { idle = false; setBusy(true, 'Waiting for MapLibre rendering') }
      const settled = (): void => { idle = true; check() }
      const error = (event: { error: Error }): void => fail(`MapLibre: ${event.error.message}`)
      const contextLost = (): void => fail('MapLibre WebGL context lost')
      const canvas = gl.getCanvas()
      gl.on('dataloading', loading)
      gl.on('render', loading)
      gl.on('idle', settled)
      gl.on('error', error)
      canvas.addEventListener('webglcontextlost', contextLost)
      layers.set(layer, {
        ready: () => idle && gl.loaded() && gl.areTilesLoaded() && !gl.isMoving(),
        cleanup: () => {
          gl.off('dataloading', loading)
          gl.off('render', loading)
          gl.off('idle', settled)
          gl.off('error', error)
          canvas.removeEventListener('webglcontextlost', contextLost)
        },
      })
    } else if (isFunction(layer.isLoading)) {
      const loading = (): void => setBusy(true, 'Waiting for Leaflet tiles')
      const error = (): void => fail('Leaflet tile failed to load')
      layer.on('loading', loading)
      layer.on('load', check)
      layer.on('tileerror', error)
      layers.set(layer, {
        ready: () => !layer.isLoading?.(),
        cleanup: () => { layer.off('loading', loading); layer.off('load', check); layer.off('tileerror', error) },
      })
    }
    check()
  }
  const add = (event: LeafletEvent): void => addLayer(event.layer as MapLayer)
  const remove = (event: LeafletEvent): void => {
    layers.get(event.layer)?.cleanup()
    layers.delete(event.layer)
    check()
  }
  const moveStart = (): void => { moving = true; check() }
  const moveEnd = (): void => { moving = false; check() }
  const zoomStart = (): void => { zooming = true; check() }
  const zoomEnd = (): void => { zooming = false; check() }
  map.eachLayer(addLayer)
  map.on('layeradd', add)
  map.on('layerremove', remove)
  map.on('movestart', moveStart)
  map.on('moveend', moveEnd)
  map.on('zoomstart', zoomStart)
  map.on('zoomend', zoomEnd)
  check()

  return () => {
    map.off('layeradd', add)
    map.off('layerremove', remove)
    map.off('movestart', moveStart)
    map.off('moveend', moveEnd)
    map.off('zoomstart', zoomStart)
    map.off('zoomend', zoomEnd)
    for (const layer of layers.values()) layer.cleanup()
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function CaptureLeafletMapComponent<Datum extends GenericDataRecord> (props: VisLeafletMapProps<Datum>, ref: ForwardedRef<VisLeafletMapRef<Datum>>): React.ReactElement {
  const map = useRef<VisLeafletMapRef<Datum>>(null)
  const status = useRef<HTMLSpanElement>(null)
  useImperativeHandle(ref, () => ({ get component () { return map.current?.component } }), [])
  useEffect(() => {
    let disposed = false
    let cleanup: (() => void) | undefined
    map.current?.component?.getLeafletInstancePromise().then(instance => {
      if (!disposed && status.current) cleanup = observeMap(instance, status.current)
    }).catch((error: unknown) => {
      if (!disposed && status.current) status.current.dataset.captureError = `Leaflet initialization failed: ${error instanceof Error ? error.message : String(error)}`
    })
    return () => { disposed = true; cleanup?.() }
  }, [])
  return <>
    <span ref={status} hidden aria-busy="true" data-capture-pending="Waiting for Leaflet initialization" />
    <Original.VisLeafletMap {...props} ref={map} duration={0} flyToDuration={0} zoomDuration={0} preserveDrawingBuffer={true} />
  </>
}

export const CaptureLeafletMap = React.forwardRef(CaptureLeafletMapComponent) as typeof Original.VisLeafletMap
