// Copyright (c) Volterra, Inc. All rights reserved.
import { AxisConfigInterface, AxisType } from '@volterra/vis'
import { XYAxisStoryConfig } from 'storybook/utils/content-wrappers'
import { DataRecord, generateDataRecords, generateTimeSeries } from 'storybook/data/time-series'
import { Story } from '@storybook/angular'

export const baseConfig = (label?: string): XYAxisStoryConfig & AxisConfigInterface<DataRecord> => ({
  storyHeight: 100,
  type: AxisType.X,
  label: label,
  gridLine: false,
})

export const baseXConfig = (label?: string): XYAxisStoryConfig & AxisConfigInterface<DataRecord> => ({
  ...baseConfig(label),
})

export const baseYConfig = (label?: string): XYAxisStoryConfig & AxisConfigInterface<DataRecord> => ({
  ...baseConfig(label),
  type: AxisType.Y,
})

export const withDataConfig = (n = 6, label?: string): XYAxisStoryConfig & AxisConfigInterface<DataRecord> => ({
  ...baseXConfig(label),
  x: d => d.x,
  y: d => d.y,
  data: generateDataRecords(n),
})

export const withTimeDataConfig = (n = 10, label?: string): XYAxisStoryConfig & AxisConfigInterface<DataRecord> => ({
  ...withDataConfig(n, label),
  data: generateTimeSeries(n).map(t => ({ x: t.timestamp, y: t.value })),
  tickFormat: x => (new Date(x)).toDateString(),
})

type MultiAxisConfig = {
  xAxis: AxisConfigInterface<DataRecord>;
  yAxis: AxisConfigInterface<DataRecord>;
}

export const multiAxisStory: Story<any> = (args: MultiAxisConfig) => {
  return {
    props: {
      x: { ...baseXConfig('X'), ...args.xAxis },
      y: { ...baseYConfig('Y'), ...args.yAxis },
    },
    template: `
      <vis-axis type="x" [label]="x.label" [position]="x.position"></vis-axis>
      <vis-axis type="y" [label]="y.label" [position]="y.position"></vis-axis>
    `,
  }
}
