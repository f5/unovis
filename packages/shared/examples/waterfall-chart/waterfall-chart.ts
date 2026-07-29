import { Axis, FitMode, StackedBar, Tooltip, XYContainer } from '@unovis/ts'

import { barTooltip, data, stepColor, WaterfallDatum } from './data'

const container = document.getElementById('vis-container')

// Every bar starts where the previous one ended, so `baseline` carries the running total
const bar = new StackedBar<WaterfallDatum>({
  x: d => d.index,
  y: d => d.value,
  baseline: d => d.start,
  color: stepColor,
  barPadding: 0.3,
  barMinHeight1Px: true,
})

const chart = new XYContainer(container, {
  height: 480,
  components: [bar],
  xAxis: new Axis<WaterfallDatum>({
    tickValues: data.map(d => d.index),
    tickFormat: (tick: number | Date) => data[+tick]?.label ?? '',
    tickTextWidth: 80,
    tickTextFitMode: FitMode.Wrap,
  }),
  yAxis: new Axis<WaterfallDatum>({
    label: '$ millions',
    tickFormat: (tick: number | Date) => `${+tick}`,
  }),
  tooltip: new Tooltip({
    triggers: {
      [StackedBar.selectors.bar]: barTooltip,
    },
  }),
}, data)
