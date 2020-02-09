// Copyright (c) Volterra, Inc. All rights reserved.
import Tangram from 'tangram'
import { getRendererSettings } from '../mapStyles/settings'

export function getTangramLayer (config): any {
  const { tamgramRenderer } = config
  const tangramLayer = (tamgramRenderer || Tangram).leafletLayer({
    scene: {
      ...getRendererSettings(config),
    },
    numWorkers: 4,
    unloadInvisibleTiles: false,
    updateWhenIdle: false,
  })

  return tangramLayer
}
