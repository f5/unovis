<script setup lang="ts">
import { FitMode, StackedBar } from '@unovis/ts'
import { VisAxis, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/vue'
import type { WaterfallDatum } from './data'
import { barTooltip, data, stepColor } from './data'

// Every bar starts where the previous one ended, so `baseline` carries the running total
const x = (d: WaterfallDatum) => d.index
const y = (d: WaterfallDatum) => d.value
const baseline = (d: WaterfallDatum) => d.start

const triggers = {
  [StackedBar.selectors.bar]: barTooltip,
}

const xAxisConfig = {
  tickValues: data.map(d => d.index),
  tickFormat: (tick: number | Date) => data[+tick]?.label ?? '',
  tickTextWidth: 80,
  tickTextFitMode: FitMode.Wrap,
}

const yTickFormat = (tick: number | Date) => `${+tick}`
</script>

<template>
  <h3>FY Income Statement Bridge</h3>
  <VisXYContainer :data :height="480">
    <VisStackedBar :x :y :baseline :color="stepColor" :barPadding="0.3" barMinHeight1Px />
    <VisTooltip :triggers />
    <VisAxis type="x" v-bind="xAxisConfig" />
    <VisAxis type="y" label="$ millions" :tickFormat="yTickFormat" />
  </VisXYContainer>
</template>
