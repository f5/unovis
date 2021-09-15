// Copyright (c) Volterra, Inc. All rights reserved.
import Tangram from 'tangram'

// Config
import { LeafletMapConfig } from 'components/leaflet-map/config'
import { TangramScene } from '../../../types'

export function getTangramLayer<Datum> (config: LeafletMapConfig<Datum>): unknown {
  const { accessToken, tangramRenderer, rendererSettings } = config
  if (!accessToken) {
    console.warn('To show map provide the tile server API key using the accessToken config property')
    return
  }
  (rendererSettings as TangramScene).global.sdk_api_key = accessToken

  const tangramLayer = (tangramRenderer || Tangram).leafletLayer({
    scene: {
      ...rendererSettings,
    },
    numWorkers: 4,
    unloadInvisibleTiles: false,
    updateWhenIdle: false,
  })

  return tangramLayer
}
