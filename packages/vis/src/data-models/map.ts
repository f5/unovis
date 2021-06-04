// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */

// Core
import { CoreDataModel } from 'data-models/core'

// Types
import { NumericAccessor } from 'types/misc'

// Utils
import { getDataLatLngBounds } from 'utils/map'

export class MapDataModel<PointDatum> extends CoreDataModel<PointDatum[]> {
  getDataLatLngBounds (pointLatitude: NumericAccessor<PointDatum>, pointLongitude: NumericAccessor<PointDatum>, paddingDegrees = 1): number[][] {
    return getDataLatLngBounds(this.data, pointLatitude, pointLongitude, paddingDegrees)
  }
}
