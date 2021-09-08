// Copyright (c) Volterra, Inc. All rights reserved.
import { ScatterConfigInterface, SymbolType } from '@volterra/vis'
import { XYChartStoryConfig } from '../../utils/xy-content-wrapper'
import { DataRecord, generateDataRecords } from '../../data/time-series'

function getArrayElement<T> (array: T[], i?: number): T {
  return array[i !== undefined ? i : Math.floor(Math.random() * array.length)]
}

export const baseConfig = (n?: number): XYChartStoryConfig & ScatterConfigInterface<DataRecord> => ({
  x: d => d.x,
  y: d => d.y,
  color: getColor(null, 0),
  data: generateDataRecords(n).map((d, i) => ({ ...d, y1: i, y2: i % 2, y3: i % 3 })),
})

export const labelConfig = (altColor?: boolean): XYChartStoryConfig & ScatterConfigInterface<DataRecord> => ({
  ...baseConfig(),
  sizeRange: [20, 30],
  color: d => ['#5242aa', '#a0d6e5'][altColor ? d.y2 : 0],
})

const constArray = Array(10).fill(0).map(() => Math.random() * 10)
export const customConfig = (): XYChartStoryConfig & ScatterConfigInterface<DataRecord> => ({
  ...baseConfig(),
  y: d => constArray[d.y1],
  size: d => d.y3 + 1,
  label: d => ['S', 'M', 'L'][d.y3],
  color: d => getColor(d, d.y3),
})

export const getColor = (_: DataRecord, i?: number): string => getArrayElement(['#6A9DFF', '#1acb9a', '#8777d9', '#f88080'], i)
export const getLabel = (_: DataRecord, i?: number): string => getArrayElement(['A', 'B', 'C'], i)
export const getShape = (_: DataRecord, i?: number): SymbolType => getArrayElement([SymbolType.Circle, SymbolType.Square, SymbolType.Star], i)
