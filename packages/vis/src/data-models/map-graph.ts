// Copyright (c) Volterra, Inc. All rights reserved.
// Data Models
import { GraphDataModel } from './graph'

export class MapGraphDataModel<NodeDatum, LinkDatum, AreaDatum> extends GraphDataModel<NodeDatum, LinkDatum> {
  private _areas: AreaDatum[] = []

  set data (inputData) {
    const data = inputData ?? {}
    super.data = data

    this._areas = data.areas ?? []
  }

  get areas (): AreaDatum[] {
    return this._areas
  }
}
