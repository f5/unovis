// Copyright (c) Volterra, Inc. All rights reserved.
import { AxisConfigInterface, AxisType } from '@volterra/vis'
import { DataRecord, generateDataRecords, generateTimeSeries } from 'storybook/data/time-series'
import { Story } from '@storybook/angular'

export type XYAxisStoryConfig = {
  data?: DataRecord[];
  showChart?: boolean;
  storyHeight?: number;
  storyStyles?: string;
}

export function xyAxisWrapper<T> (story: Story<XYAxisStoryConfig & T>): string {
  return `
    <div [ngStyle]="{'width.%': 100, 'height.px': storyHeight ?? 300 }">
      <vis-xy-container [data]="data" [style]="storyStyles">
        ${story}
        <vis-line *ngIf="showChart" [x]="x" [y]="y"></vis-line>
      </vis-xy-container>
    </div>
  `
}

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
