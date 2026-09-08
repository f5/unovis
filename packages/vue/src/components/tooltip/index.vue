<script setup lang="ts">
// !!! This code was automatically generated. You should not change it !!!
import type { TooltipConfigInterface } from '@unovis/ts'
import { Tooltip } from '@unovis/ts'
import { inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { tooltipAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

const props = defineProps<Props & { data?: null }>()

const accessor = inject(tooltipAccessorKey)

// data and required props
type Props = TooltipConfigInterface
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
    component.value?.render()
  }
})

defineExpose({
  component,
})
</script>

<script lang="ts">
export const VisTooltipSelectors = Tooltip.selectors
</script>

<template>
  <div data-vis-tooltip />
</template>
