<script setup lang="ts" >
// !!! This code was automatically generated. You should not change it !!!
import { Annotations, AnnotationsConfigInterface, AnnotationItem } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
import { annotationsAccessorKey } from '../../utils/context'

const accessor = inject(annotationsAccessorKey)

// data and required props 
interface Props extends  AnnotationsConfigInterface { }
const props = defineProps<Props & { data?: Datum[] }>()

const data = computed(() => accessor.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<Annotations>()


onMounted(() => {
  nextTick(() => {
    component.value = new Annotations(config.value)
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

watch(data, () => {
  component.value?.setData(data.value)
})

defineExpose({
  component
})
</script>

<template>
  <div data-vis-annotations />
</template>


