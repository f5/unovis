// Copyright (c) Volterra, Inc. All rights reserved.
import { AreaConfigInterface, LineConfigInterface } from '@volterra/vis'
import { XYChartStoryConfig } from '../../utils/content-wrappers'
import { DataRecord, generateDataRecords } from '../../data/time-series'

export const baseConfig = (n?: number): XYChartStoryConfig & AreaConfigInterface<DataRecord> => ({
  x: d => d.x,
  y: d => d.y,
  data: generateDataRecords(n),
})

export const getColor = (_: DataRecord[], i: number): string => (['#FF4F4E', '#FFBA00', '#2BAB44'])[i]

export const minBarHeightExampleData = generateDataRecords(20)
  .map((d, i) => ({ ...d, y: i % 3 ? Number.MIN_VALUE : d.y }))
