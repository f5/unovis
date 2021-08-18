// Copyright (c) Volterra, Inc. All rights reserved.
import { AreaConfigInterface } from '@volterra/vis'
import { XYChartStoryConfig } from '../../utils/content-wrappers'
import { DataRecord, generateDataRecords } from '../../data/time-series'

export const baseConfig = (n?: number): XYChartStoryConfig & AreaConfigInterface<DataRecord> => ({
  x: d => d.x,
  y: d => d.y,
  data: generateDataRecords(n),
})

// export const getColor = (_: DataRecord[], i: number): string => (['#FF4F4E', '#FFBA00', '#2BAB44'])[i]
export const getColor = (d: DataRecord, i: number): string => d.y > 7 ? '#FF4F4E' : null

export const minBarHeightExampleData = generateDataRecords(20)
  .map((d: DataRecord, i: number) => ({
    ...d,
    y: i % 3 ? 0
      : i % 6 ? null
        : d.y,
  }))
