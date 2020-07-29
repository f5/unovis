// Copyright (c) Volterra, Inc. All rights reserved.
import Tangram from 'tangram'
import { getRendererSettings } from './settings'

export function getTangramLayer (config): any {
  const { accessToken, tamgramRenderer } = config
  if (!accessToken) {
    console.warn('To show map provide Nextzen API Key using the accessToken config property')
    return
  }

  const tangramScene = getRendererSettings(config)
  tangramScene.global.sdk_api_key = accessToken

  const tangramLayer = (tamgramRenderer || Tangram).leafletLayer({
    scene: {
      ...tangramScene,
    },
    numWorkers: 4,
    unloadInvisibleTiles: false,
    updateWhenIdle: false,
  })

  return tangramLayer
}
