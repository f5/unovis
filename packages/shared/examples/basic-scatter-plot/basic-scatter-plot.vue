<script lang='ts'>
import type { NumericAccessor, StringAccessor } from '@unovis/ts'
import { VisXYContainer, VisScatter, VisAxis, VisBulletLegend } from '@unovis/svelte'
import { data, DataRecord } from './data'

const legendItems = [
  { name: 'Male', color: '#1fc3aa' },
  { name: 'Female', color: '#8624F5' },
  { name: 'No Data', color: '#aaa' },
]

const x: NumericAccessor<DataRecord> = d => d.beakLength
const y: NumericAccessor<DataRecord> = d => d.flipperLength
const color: StringAccessor<DataRecord> = d => legendItems.find(i => i.name === (d.sex ?? 'No Data'))?.color
</script>

<template>
  <VisBulletLegend :items="legendItems"/>
  <VisXYContainer :data="data" :height="600">
    <VisScatter :x="x" :y="y" :color="color" :size="8"/>
    <VisAxis type='x' label='Beak Length (mm)' />
    <VisAxis type='y' label='Flipper Length (mm)'/>
  </VisXYContainer>
</template>