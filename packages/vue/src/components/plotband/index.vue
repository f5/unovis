<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import type { PlotbandConfigInterface } from '@unovis/ts'
import { Plotband } from '@unovis/ts'
import { inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { componentAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

const props = defineProps<Props & { data?: null }>()

const accessor = inject(componentAccessorKey)

// data and required props
type Props = PlotbandConfigInterface<Datum>
// config
const config = useForwardProps(props)

// component declaration
const component = ref<Plotband<Datum>>()

onMounted(() => {
  nextTick(() => {
    component.value = new Plotband<Datum>(config.value)

    accessor.update(component.value)
  })
})

onUnmounted(() => {
  component.value?.destroy()
  accessor.destroy()
})

watch(config, (curr, prev) => {
  if (!arePropsEqual(curr, prev)) {
    component.value?.setConfig(config.value)
    component.value?.render()
  }
})

defineExpose({
  component,
})
</script>

<script lang="ts">
export const VisPlotbandSelectors = Plotband.selectors
</script>

<template>
  <div data-vis-component />
</template>
