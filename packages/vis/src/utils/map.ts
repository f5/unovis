// Copyright (c) Volterra, Inc. All rights reserved.
import { min, max } from 'd3-array'

// Types
import { NumericAccessor } from 'types/accessor'

// Utils
import { getValue } from 'utils/data'

export function getDataLatLngBounds<D> (
  data: D[],
  pointLatitude: NumericAccessor<D>,
  pointLongitude: NumericAccessor<D>,
  paddingDegrees = 1
): number[][] {
  const northWest = {
    lat: max(data ?? [], d => getValue(d, pointLatitude)),
    lng: min(data ?? [], d => getValue(d, pointLongitude)),
  }

  const southEast = {
    lat: min(data ?? [], d => getValue(d, pointLatitude)),
    lng: max(data ?? [], d => getValue(d, pointLongitude)),
  }

  return [
    [northWest.lat + paddingDegrees || 90, northWest.lng - paddingDegrees || -180],
    [southEast.lat - paddingDegrees || -70, southEast.lng + paddingDegrees || 180],
  ]
}
