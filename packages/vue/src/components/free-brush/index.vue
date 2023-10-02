<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import { FreeBrush, FreeBrushConfigInterface } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, getCurrentInstance, nextTick, inject } from 'vue'
import { arePropsEqual, parseProps } from '../../utils/props'
import { componentAccessorKey } from '../../utils/context'

const accessor = inject(componentAccessorKey)

// data and required props
const props = defineProps<FreeBrushConfigInterface<Datum> & { data?: Datum[] }>()
const data = computed(() => accessor.data.value ?? props.data)
// config
const instance = getCurrentInstance()
const config = computed(() => parseProps({ ...props }, instance))

// component declaration
const component = ref<FreeBrush<Datum>>()


onMounted(() => {
  nextTick(() => {
    component.value = new FreeBrush<Datum>(config.value)
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


