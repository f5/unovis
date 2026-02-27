<script lang="ts">
// !!! This code was automatically generated. You should not change it !!!
import { Annotations, AnnotationsConfigInterface, AnnotationItem } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
import { annotationsAccessorKey } from '../../utils/context'
interface Props extends /** @vue-ignore */ AnnotationsConfigInterface { }
export const VisAnnotationsSelectors = Annotations.selectors
</script>

<script setup lang="ts" >
const accessor = inject(annotationsAccessorKey)

const props = defineProps<Props & { data?: null }>()


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
  }
})


defineExpose({
  component
})
</script>

<template>
  <div data-vis-annotations />
</template>


