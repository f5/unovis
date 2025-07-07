<script setup lang="ts">
import { Area } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisArea } from '@unovis/vue'
import { data, countries, FoodExportData, bulletLegends } from './data'
import './styles.css'

const x = (d: FoodExportData) => d.year
const y = countries.map(g => (d: FoodExportData) => d[g])
const attributes = {
        [Area.selectors.area]: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'custom-stroke-styles': (_: FoodExportData, i: number) => {
            return i === 0 ? 'true' : 'false'
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'e2e-test-id': (_: FoodExportData, i: number) => `area-segment-${i}`,
        },
      }
</script>

<template>
  <VisXYContainer :data="data" :height="500">
    <VisBulletLegend :items="Object.values(bulletLegends)" />
    <VisArea :x="x" :y="y" :attributes="attributes"/>
    <VisAxis type='x' label='Year' :numTicks="10" :gridLine="false" :domainLine="false" />
    <VisAxis type='y' label='Food Exports(% of merchandise exports)' :numTicks="10" />
  </VisXYContainer>
</template>
