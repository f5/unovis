// Copyright (c) Volterra, Inc. All rights reserved.
import { StackedBar, XYComponentCore, TooltipConfigInterface, Scatter, Line } from '@volterra/vis'
import { DataRecord } from '../../data/time-series'

export type TooltipStoryConfig = TooltipConfigInterface<XYComponentCore<DataRecord>, DataRecord>

const colors = Array(4).fill(0).map((_, i) => `var(--vis-color${i})`)
const defaultChartConfig = { x: d => d.x, y: d => d.y }
const defaultTrigger = (d: DataRecord): string => `<p>x: ${d.x}</p><p>y: ${d.y.toFixed(2)}</p>`

export const barTooltipConfig = (): TooltipStoryConfig => ({
  components: [new StackedBar<DataRecord>({ ...defaultChartConfig, roundedCorners: 5 })],
  triggers: {
    [StackedBar.selectors.bar]: defaultTrigger,
  },
})

export const lineTooltipConfig = (): TooltipStoryConfig => ({
  components: [new Line<DataRecord>({ ...defaultChartConfig, color: () => colors[3] })],
  triggers: {
    [Line.selectors.line]: () => '<p>Line</p>',
  },
})

export const scatterTooltipConfig = (): TooltipStoryConfig => ({
  components: [new Scatter<DataRecord>({ ...defaultChartConfig, color: () => colors[0], sizeRange: [10, 20] })],
  triggers: {
    [Scatter.selectors.point]: defaultTrigger,
  },
})

export const multiTooltipConfig = (): TooltipStoryConfig => {
  const yVars = [d => d.y2, d => d.y1, d => d.y4]
  return {
    components: [
      new StackedBar<DataRecord>({ ...defaultChartConfig, y: yVars, barWidth: 20, color: (_, i) => colors[i] }),
      new Line<DataRecord>({ x: d => d.x, y: d => d.y / 2, color: () => colors[3] }),
    ],
    triggers: {
      [Line.selectors.line]: () => '<p>Target</p>',
      [StackedBar.selectors.bar]: d => {
        const data = yVars.map(fn => fn(d))
        const total = data.reduce((acc, curr) => acc + curr, 0)
        return `
          <center>
            <h3>x: ${d.x}, y: ${total.toFixed(2)}</h3>
            ${data.map((d, i) => `<span style="color: ${colors[i]}">${(d / total * 100).toFixed(2)}%</span>`).join('<br/>')}
          </center> 
        `
      },
    },
  }
}
