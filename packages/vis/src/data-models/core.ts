// Copyright (c) Volterra, Inc. All rights reserved.

export class CoreDataModel<CoreDatum> {
  data?: CoreDatum

  constructor (data?: CoreDatum) {
    this.data = data
  }
}
