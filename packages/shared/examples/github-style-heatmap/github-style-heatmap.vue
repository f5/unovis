<script setup lang="ts">
import { VisSingleContainer, VisHeatmap } from '@unovis/vue'
import { Sizing } from '@unovis/ts'
import { data, DataRecord, numRows, offset, columnLabel, rowLabel } from './data'

const value = (d: DataRecord): number | undefined => d.count || undefined
</script>

<template>
  <VisSingleContainer :sizing="Sizing.Extend">
    <VisHeatmap
      :data="data"
      :value="value"
      :numRows="numRows"
      :offset="offset"
      :cellSize="14"
      :cellPadding="3"
      :cellCornerRadius="3"
      :columnLabel="columnLabel"
      :rowLabel="rowLabel"
    />
  </VisSingleContainer>
</template>
