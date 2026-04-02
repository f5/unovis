<script setup lang="ts" >
// !!! This code was automatically generated. You should not change it !!!
import { Tooltip, TooltipConfigInterface } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
import { tooltipAccessorKey } from '../../utils/context'

const accessor = inject(tooltipAccessorKey)

// data and required props 
type Props = TooltipConfigInterface
const props = defineProps<Props & { data?: null }>()


// config
const config = useForwardProps(props)

// component declaration
const component = ref<Tooltip>()


onMounted(() => {
  nextTick(() => {
    component.value = new Tooltip(config.value)
    
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
  }
})


defineExpose({
  component
})
</script>

<script lang="ts">
export const VisTooltipSelectors = Tooltip.selectors
</script>

<template>
  <div data-vis-tooltip />
</template>


