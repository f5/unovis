// Copyright (c) Volterra, Inc. All rights reserved.

export class CoreDataModel<CoreDatum> {
  protected _data?: CoreDatum

  get data (): CoreDatum {
    return this._data
  }

  set data (value: CoreDatum) {
    this._data = value
  }

  constructor (data?: CoreDatum) {
    this.data = data
  }
}
