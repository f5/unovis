<script setup lang="ts">
import { VisXYContainer, VisBulletLegend, VisTooltip, VisAxis, VisScatter, VisLine  } from '@unovis/vue'
import { Scale, Scatter } from '@unovis/ts'
import { data, DataRecord, processLineData } from './data'

const height = 1600
const yScale = Scale.scalePoint([0, 800]).domain(data.map(d => d.occupation))
const lineData = processLineData(data)
const legendItems = [{name: "Women", color: '#FF6B7E'}, {name: 'Men', color: '#4D8CFD'}]
const tooltipTriggers = {
  [Scatter.selectors.point]: (d: DataRecord) => `
    Women average pay: $${Intl.NumberFormat().format(d.women)} </br>
    Men average pay: $${Intl.NumberFormat().format(d.men)} </br>
    Pay gap: $${Intl.NumberFormat().format(d.gap)}</br>
  `,
}
const xLine = (d: DataRecord) => d.x
const yLine = (d: DataRecord) => yScale(d.y)

const y = (d: DataRecord) => yScale(d.occupation)
const xWomen = (d: DataRecord) => d.women
const xMen = (d: DataRecord) => d.men
const tickFormat = (_, i: number) => data[i].occupation
</script>

<template>
  <VisBulletLegend :items='legendItems'/>
  <VisXYContainer
      :height= "height"
    >
    <VisLine
      :data="lineData"
      :x="xLine"
      :y="yLine"
      :color="'grey'" 
    />
    <VisScatter
      :data="data"
      :x="xMen"
      :y="y"
      :color="'#4D8CFD'"
      :size="10"
    />
    <VisScatter
      :color="'#FF6B7E'"
      :data="data"
      :x="xWomen"
      :y="y"
      :size="10"
    />
    <VisAxis type='x' :numTicks=5 :label="'Yearly Salary'"/>
    <VisAxis type='y'
      :tickFormat="tickFormat"
      :numTicks='data.length' 
      :gridLine='false'
    />
    <VisTooltip :triggers="tooltipTriggers"/>
  </VisXYContainer>
</template>
