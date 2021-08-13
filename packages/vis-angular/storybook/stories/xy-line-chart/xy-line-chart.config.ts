// Copyright (c) Volterra, Inc. All rights reserved.
import { LineConfigInterface } from '@volterra/vis'
import { XYChartStoryConfig } from '../../utils/content-wrappers'
import { DataRecord, generateDataRecords } from '../../data/time-series'

export const baseConfig = (n?: number): XYChartStoryConfig & LineConfigInterface<DataRecord> => ({
  x: d => d.x,
  y: d => d.y,
  data: generateDataRecords(n),
})

export const incompleteConfig = (missing: number[]): XYChartStoryConfig & LineConfigInterface<DataRecord> => ({
  x: d => d.x,
  y: d => missing.includes(d.x) ? undefined : d.y,
  data: Array(10).fill(0).map((_, i) => ({ x: i, y: i })),
})

export const getColor = (_: DataRecord[], i: number): string => (['#FF4F4E', '#FFBA00', '#2BAB44'])[i]
export const getDashes = (_: DataRecord[], i: number): any => [[5], [2, 2, 2], undefined][i]
