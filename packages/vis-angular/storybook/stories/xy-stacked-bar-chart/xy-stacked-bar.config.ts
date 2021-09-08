// Copyright (c) Volterra, Inc. All rights reserved.
import { StackedBarConfigInterface } from '@volterra/vis'
import { XYChartStoryConfig } from '../../utils/xy-content-wrapper'
import { DataRecord, generateDataRecords } from '../../data/time-series'

export const baseConfig = (n = 25): XYChartStoryConfig & StackedBarConfigInterface<DataRecord> => ({
  x: d => d.x,
  y: d => d.y,
  data: generateDataRecords(n),
})

// export const getColor = (_: DataRecord[], i: number): string => (['#FF4F4E', '#FFBA00', '#2BAB44'])[i]
export const getColor = (d: DataRecord, i: number): string => d.y > 7 ? '#FF4F4E' : null

export const minBarHeightExampleData = generateDataRecords(50)
  .map((d: DataRecord, i: number) => ({
    ...d,
    y: (i % 3 && Math.random() > 0.5)
      ? (Math.random() > 0.5) ? 0 : null
      : d.y,
  }))

export const dataStepExampleData = generateDataRecords(50)
  .map((d: DataRecord, i: number) => Math.random() > 0.3 ? d : null)
  .filter((d: DataRecord) => d)
