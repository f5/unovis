<script setup lang="ts">
// !!! This code was automatically generated. You should not change it !!!
import type { AnnotationsConfigInterface } from '@unovis/ts'
import { Annotations } from '@unovis/ts'
import { inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { annotationsAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

const props = defineProps<Props & { data?: null }>()

const accessor = inject(annotationsAccessorKey)

// data and required props
type Props = AnnotationsConfigInterface
// config
const config = useForwardProps(props)

// component declaration
const component = ref<Annotations>()

onMounted(() => {
  nextTick(() => {
    component.value = new Annotations(config.value)

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
export const VisAnnotationsSelectors = Annotations.selectors
</script>

<template>
  <div data-vis-annotations />
</template>
