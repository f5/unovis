// Copyright (c) Volterra, Inc. All rights reserved.
import { Story } from '@storybook/angular'
import { DataRecord } from '../data/time-series'

export type XYChartStoryConfig = {
  data: DataRecord[];
  storyHideAxes?: boolean;
  storyWidth?: number;
  storyHeight?: number;
}

export function xyChartContentWrapper<T> (story: Story<XYChartStoryConfig & T>): string {
  return `
    <div style="width: 100%; position: relative" [ngStyle]="{'width.px': storyWidth, 'height.px': storyHeight ?? 300 }">
      <vis-xy-container [data]="data">
        <vis-axis *ngIf="!storyHideAxes" type="x" label="X"></vis-axis>
        <vis-axis *ngIf="!storyHideAxes" type="y" label="Y"></vis-axis>
        ${story}
      </vis-xy-container>
    </div>
  `
}
