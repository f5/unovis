<script setup lang="ts" generic="Datum = any">
import type { TooltipConfigInterface, TooltipContent, TooltipContentMap } from '@unovis/ts'
import { getTooltipContentTargets, Tooltip } from '@unovis/ts'
import { inject, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { tooltipAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

const props = defineProps<Omit<TooltipConfigInterface, 'content'> & { content?: TooltipContentMap<string>, data?: null }>()
defineSlots<{ [name: string]: (context: TooltipContent<Datum>) => any }>()
const accessor = inject(tooltipAccessorKey, undefined)
const forwarded = useForwardProps(props)
const component = shallowRef<Tooltip>()
const context = shallowRef<TooltipContent<Datum> | null>(null)
let disposed = false

function getSlotName(): string {
  const target = context.value?.trigger
  return target !== undefined ? props.content?.[target] ?? '' : ''
}

function renderContent(value: TooltipContent | null): void {
  context.value = value as TooltipContent<Datum> | null
}

onMounted(() => {
  nextTick(() => {
    if (disposed)
      return
    const { content, ...config } = forwarded.value
    component.value = new Tooltip(config)
    component.value.setContentRenderer(renderContent, getTooltipContentTargets(content))
    accessor?.update(component.value)
  })
})

onUnmounted(() => {
  disposed = true
  component.value?.setContentRenderer(undefined)
  component.value?.destroy()
  accessor?.destroy()
})

watch(forwarded, (curr, prev) => {
  const { content, ...config } = curr
  const { content: previousContent, ...previousConfig } = prev
  if (!arePropsEqual(config, previousConfig)) {
    component.value?.setConfig(config)
    accessor?.dirty()
  }
})

watch(() => getTooltipContentTargets(props.content), (targets) => {
  component.value?.setContentRenderer(renderContent, targets)
})

defineExpose({ component })
</script>

<script lang="ts">
export const VisTooltipSelectors = Tooltip.selectors
</script>

<template>
  <div data-vis-tooltip />
  <Teleport v-if="component && context" :to="component.contentElement">
    <slot :name="getSlotName()" v-bind="context" />
  </Teleport>
</template>
