// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { min, max } from 'd3-array'

// Core
import { CoreDataModel } from 'data-models/core'

// Types
import { NumericAccessor } from 'types/misc'

// Utils
import { getValue } from 'utils/data'

export class MapDataModel<PointDatum> extends CoreDataModel<PointDatum[]> {
  data: PointDatum[] = []

  getDataLatLngBounds (pointLatitude: NumericAccessor<PointDatum>, pointLongitute: NumericAccessor<PointDatum>, paddingDegrees = 1): number[][] {
    if (!this.data.length) return

    const northWest = {
      lat: max(this.data, d => getValue(d, pointLatitude)),
      lng: min(this.data, d => getValue(d, pointLongitute)),
    }

    const southEast = {
      lat: min(this.data, d => getValue(d, pointLatitude)),
      lng: max(this.data, d => getValue(d, pointLongitute)),
    }

    return [
      [northWest.lat + paddingDegrees || 90, northWest.lng - paddingDegrees || -180],
      [southEast.lat - paddingDegrees || -70, southEast.lng + paddingDegrees || 180],
    ]
  }
}
