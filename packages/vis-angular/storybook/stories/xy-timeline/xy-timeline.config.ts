// Copyright (c) Volterra, Inc. All rights reserved.
import { TimelineConfigInterface } from '@volterra/vis'
import { XYChartStoryConfig } from '../../utils/xy-content-wrapper'
import { DataRecord } from '../../data/time-series'

export const baseConfig = (n = 25): XYChartStoryConfig & TimelineConfigInterface<DataRecord> => ({
  x: d => d.x,
  y: d => d.y,
  data: [],
})
