<script setup lang="ts">
import type { NumericAccessor } from '@unovis/ts'
import { CurveType } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisArea, VisBulletLegend } from '@unovis/vue'
import { countries, Country, data, DataRecord } from './data'

const x = (_: DataRecord, i: number) => i
const accessors = (id: Country): { y: NumericAccessor<DataRecord>; color: string } => ({
  y: (d: DataRecord) => d.cases[id],
  color: countries[id].color,
})
const xTicks = (i: number): string => `${data[i].month} ${data[i].year}`
const yTicks = Intl.NumberFormat(navigator.language, { notation: 'compact' }).format
</script>

<template>
  <VisXYContainer :data="data" :height="400">
    <VisBulletLegend :items="Object.values(countries)" />
    <VisArea :x="x" v-bind="accessors(Country.UnitedStates)" :opacity="0.7" :curveType="CurveType.Basis" />
    <VisArea :x="x" v-bind="accessors(Country.India)" :opacity="0.7" :curveType="CurveType.Basis" />
    <VisAxis type='x' :tickFormat="xTicks" />
    <VisAxis type='y' :tickFormat="yTicks" />
  </VisXYContainer>
</template>
