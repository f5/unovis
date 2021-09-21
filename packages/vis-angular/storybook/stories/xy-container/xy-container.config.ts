// Copyright (c) Volterra, Inc. All rights reserved.
import { Axis, Line, Scatter, StackedBar, Tooltip, XYContainerConfigInterface } from '@volterra/vis'
import { DataRecord, generateDataRecords } from 'storybook/data/time-series'

const baseComponentConfig = { x: d => d.x, y: d => d.y }

export type ContainerConfig = XYContainerConfigInterface<DataRecord> & {
  config: XYContainerConfigInterface<DataRecord>;
  sideElement?: boolean;
  storyHeight?: number;
  storyWidth?: number;
  data?: DataRecord[];
}

export const defaultArgs = (): ContainerConfig => ({
  config: {
    xAxis: new Axis<DataRecord>({ gridLine: false }),
    yAxis: new Axis<DataRecord>({ gridLine: false }),
    tooltip: new Tooltip({
      triggers: {
        [StackedBar.selectors.bar]: (d: any) => `<div>${d.x}, ${d.y.toFixed(2)}</div>`,
        [Scatter.selectors.point]: (d: any) => `<div>${d.x}, ${d.y}</div>`,
      },
    }),
  },
  sideElement: false,
  storyHeight: 300,
  storyWidth: 300,
})

export const baseConfig = (n = 50): ContainerConfig => ({
  data: generateDataRecords(n),
  config: {
    ...defaultArgs().config,
    components: [new StackedBar<DataRecord>(baseComponentConfig)],
  },
})

export const skewedConfig = (): ContainerConfig => ({
  data: generateDataRecords(100).map(d => ({ x: d.x + 1, y: d.x + 1 })),
  config: {
    ...defaultArgs().config,
    components: [
      new Line<DataRecord>({ ...baseComponentConfig, lineWidth: 7 }),
      new Scatter<DataRecord>({ ...baseComponentConfig, color: () => '#5242aa', sizeRange: [5, 10] }),
    ],
  },
})

export const specialConfig = (n = 100, xMax = 50, yMax = 50, outliers = []): ContainerConfig => ({
  ...baseConfig(),
  data: Array(n).fill(0).map((_, i) => ({ x: xMax ? i : 0.5, y: yMax ? Math.random() * yMax : 0.5 })).concat(outliers),
})

export const flatConfig = (): ContainerConfig => ({
  ...specialConfig(20, 50, 50, [
    { x: -20, y: 75 },
    { x: 60, y: -100 },
    { x: -75, y: -75 },
    { x: 70, y: 135 },
  ]),
  config: {
    ...defaultArgs().config,
    components: [new Scatter<DataRecord>({ ...baseComponentConfig, color: () => '#5242aa' })],
  },
  storyHeight: 200,
})

export const scaleByDomainStoryData = Array(100)
  .fill(0)
  .map((_, i) => ({ x: i, y: i + i * Math.sin(i / 10) }))
