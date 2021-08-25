// Copyright (c) Volterra, Inc. All rights reserved.
import { Story } from '@storybook/angular'
import { DataRecord } from '../data/time-series'

export type XYChartStoryConfig = {
  data: DataRecord[];
  storyHideAxes?: boolean;
  storyHideXAxis?: boolean;
  storyHideYAxis?: boolean;
  storyWidth?: number;
  storyHeight?: number;
  storyXAxisLabel?: string;
  storyYAxisLabel?: string;
  storyStyles?: string;
}

export function xyChartContentWrapper<T> (story: Story<XYChartStoryConfig & T>): string {
  return `
    <div style="width: 100%; position: relative" [ngStyle]="{'width.px': storyWidth, 'height.px': storyHeight ?? 300 }">
      <vis-xy-container [data]="data" [style]="storyStyles">
        <vis-axis *ngIf="!storyHideAxes && !storyHideXAxis" type="x" [label]="storyXAxisLabel ?? X"></vis-axis>
        <vis-axis *ngIf="!storyHideAxes && !storyHideYAxis" type="y" [label]="storyYAxisLabel ?? Y"></vis-axis>
        ${story}
      </vis-xy-container>
    </div>
  `
}

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
