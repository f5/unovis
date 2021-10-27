// Copyright (c) Volterra, Inc. All rights reserved.
import { DonutConfigInterface } from '@volterra/vis'
import { SingleVisStoryConfig } from '../../utils/single-content-wrapper'
import { DataRecord } from '../../data/time-series'

export const baseConfig = (n = 25): SingleVisStoryConfig & DonutConfigInterface<DataRecord> => ({
  data: [],
  value: (d: DataRecord) => d.y,
})
