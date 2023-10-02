<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import { XYLabels, XYLabelsConfigInterface, NumericAccessor } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, getCurrentInstance, nextTick, inject } from 'vue'
import { arePropsEqual, parseProps } from '../../utils/props'
import { componentAccessorKey } from '../../utils/context'

const accessor = inject(componentAccessorKey)

// data and required props
const props = defineProps<XYLabelsConfigInterface<Datum> & { data?: Datum[] }>()
const data = computed(() => accessor.data.value ?? props.data)
// config
const instance = getCurrentInstance()
const config = computed(() => parseProps({ ...props }, instance))

// component declaration
const component = ref<XYLabels<Datum>>()


onMounted(() => {
  nextTick(() => {
    component.value = new XYLabels<Datum>(config.value)
    component.value?.setData(data.value)
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

<template>
  <div data-vis-component />
</template>


