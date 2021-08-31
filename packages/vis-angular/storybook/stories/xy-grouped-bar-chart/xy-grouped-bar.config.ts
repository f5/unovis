// Copyright (c) Volterra, Inc. All rights reserved.
import { GroupedBarConfigInterface } from '@volterra/vis'
import { XYChartStoryConfig } from '../../utils/xy-content-wrapper'
import { DataRecord, generateDataRecords } from '../../data/time-series'

export const baseConfig = (n = 25): XYChartStoryConfig & GroupedBarConfigInterface<DataRecord> => ({
  x: d => d.x,
  y: d => d.y,
  data: generateDataRecords(n),
})

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
