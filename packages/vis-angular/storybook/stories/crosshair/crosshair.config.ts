// Copyright (c) Volterra, Inc. All rights reserved.
import { Story } from '@storybook/angular'
import { CrosshairConfigInterface } from '@volterra/vis'
import { DataRecord, generateDataRecords } from 'storybook/data/time-series'
import { XYChartStoryConfig } from '../../utils/xy-content-wrapper'

type CrosshairStoryConfig = XYChartStoryConfig & CrosshairConfigInterface & {
  data: DataRecord[];
  showArea: boolean;
  showBar?: boolean;
  showLine?: boolean;
  chartX?: (d: DataRecord) => number;
  chartY?: (d: DataRecord) => number;
}

const baseConfig = (n = 10): CrosshairStoryConfig => ({
  x: d => d.x,
  y: d => d.y,
  data: generateDataRecords(n),
  chartX: d => d.x,
  chartY: [d => d.y2, d => d.y1, d => d.y4],
})

export const areaChartConfig = (n?: number): CrosshairStoryConfig => ({
  ...baseConfig(n),
  showArea: true,
})

export const barChartConfig = (n?: number): CrosshairStoryConfig => ({
  ...baseConfig(n),
  showBar: true,
})

export const lineChartConfig = (n?: number): CrosshairStoryConfig => ({
  ...baseConfig(n),
  showLine: true,
})

export const getTemplate = (d: DataRecord): string => `<div>x: ${d.x}<br/>y: ${d.y.toFixed(3)}</div>`

export const crosshairWrapper = (story: Story<CrosshairStoryConfig>): string => `
    <vis-line *ngIf="showLine" [x]="chartX" [y]="chartY"></vis-line>
    <vis-stacked-bar *ngIf="showBar" [x]="chartX" [y]="chartY" [barWidth]="100"></vis-stacked-bar>
    <vis-area *ngIf="showArea" [x]="chartX" [y]="chartY"></vis-area>
    ${story}
    <vis-tooltip></vis-tooltip>
  `
