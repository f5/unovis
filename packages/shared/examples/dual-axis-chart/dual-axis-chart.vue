<script setup lang="ts">
import { VisXYContainer, VisArea, VisAxis, VisLine } from '@unovis/vue'
import { XYDataRecord, generateXYDataRecords } from './data'
const margin = { left: 100, right: 100, top: 40, bottom: 60 }
const style: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '40vh' }

const chartX = d => d.x
const chartAY = (d: XYDataRecord, i: number) => i * (d.y || 0)
const chartBY = (d: XYDataRecord) => 20 + 10 * (d.y2 || 0)
const xTicks = (x: number) => `${x}ms`
const chartAYTicks = (y: number) => `${y}bps`
const chartBYTicks = (y: number) => `${y}db`
</script>

<template>
  <VisXYContainer
      :data=generateXYDataRecords(150)
      :margin= margin
      :autoMargin= false
      :width="'100%'"
      :height= "'40vh'"
    >
      <VisArea :x=chartX :y=chartAY :opacity=0.9 :color="'#FF6B7E'" />
      <VisAxis type='x' :numTicks=3 :tickFormat="xTicks" :label="'Time'"/>
      <VisAxis type='y'
        :tickFormat="chartAYTicks"
        :tickTextWidth=60
        :tickTextColor="'#FF6B7E'"
        :labelColor="'#FF6B7E'"
        :label="'Traffic'"
      />
    </VisXYContainer>
    <VisXYContainer
      :data=generateXYDataRecords(150)
      :yDomain="[0, 150]"
      :margin=margin
      :autoMargin=false
      :style=style
    >
      <VisLine :x=chartX :y=chartBY />
      <VisAxis
        type='y'
        :position="'right'"
        :tickFormat="chartBYTicks"
        :gridLine=false
        :tickTextColor="'#4D8CFD'"
        :labelColor="'#4D8CFD'"
        :label="'Signal Strength'"
      />
    </VisXYContainer>
</template>
