// Copyright (c) Volterra, Inc. All rights reserved.

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Graph Data Model
import { GraphDataModel } from './graph'

export class MapGraphDataModel<NodeDatum extends GraphInputNode, LinkDatum extends GraphInputLink, AreaDatum> extends GraphDataModel<NodeDatum, LinkDatum> {
  private _areas: AreaDatum[] = []

  // eslint-disable-next-line accessor-pairs
  set data (inputData) {
    const data = inputData ?? {}
    super.data = data

    this._areas = data.areas ?? []
  }

  get areas (): AreaDatum[] {
    return this._areas
  }
}
