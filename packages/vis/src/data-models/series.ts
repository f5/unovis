// Copyright (c) Volterra, Inc. All rights reserved.
// Core
import { CoreDataModel } from './core'

export class SeriesDataModel<Datum> extends CoreDataModel<Datum[]> {
  constructor (data?: Datum[]) {
    super(data)
  }

  get data (): Datum[] {
    return this._data ?? []
  }

  set data (data: Datum[]) {
    if (Array.isArray(data)) this._data = data
  }
}
