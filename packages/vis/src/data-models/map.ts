// Copyright (c) Volterra, Inc. All rights reserved.

// Core
import { CoreDataModel } from 'data-models/core'

// Types
import { NumericAccessor } from 'types/accessor'

// Utils
import { getDataLatLngBounds } from 'utils/map'

export class MapDataModel<PointDatum> extends CoreDataModel<PointDatum[]> {
  getDataLatLngBounds (
    pointLatitude: NumericAccessor<PointDatum>,
    pointLongitude: NumericAccessor<PointDatum>,
    paddingDegrees = 1
  ): [[number, number], [number, number]] {
    return getDataLatLngBounds(this.data, pointLatitude, pointLongitude, paddingDegrees)
  }
}
