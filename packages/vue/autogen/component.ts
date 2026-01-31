/* eslint-disable max-len */
import { ConfigProperty, GenericParameter } from '@unovis/shared/integrations/types'

export function getComponentCode (
  componentName: string,
  generics: GenericParameter[] | undefined,
  requiredProps: ConfigProperty[],
  importStatements: { source: string; elements: string[] }[],
  dataType: string | null = 'Data',
  elementSuffix = 'component',
  isStandAlone = false,
  renderIntoProvidedDomNode = false,
  styles?: string[]
): string {
  const genericsExtend = generics ? `generic="${generics?.map((g, i) => g.extends ? `${g.name} extends ${g.extends}` : g.name)}"` : ''
  const genericsStr = generics ? `<${generics?.map(g => g.name).join(', ')}>` : ''
  const propDefs = dataType ? ['const data = computed(() => accessor.data.value ?? props.data)'] : []
  const componentType = [componentName, genericsStr].join('')
  const constructorArgs = isStandAlone
    ? `elRef.value, ${renderIntoProvidedDomNode ? '{ ...config.value, renderIntoProvidedDomNode: true }' : 'config.value'}${dataType ? ', data.value' : ''}`
    : 'config.value'

  // Vue 3.3.4 has issue resolving complex Typescript, in this case when the type has `WithOptional`.
  // If the build is failing, add the respective component here.
  const complexPropComponent = ['Timeline', 'Crosshair']
  const isComplexPropComponent = complexPropComponent.includes(componentName)

  return `<script setup lang="ts" ${genericsExtend}>
// !!! This code was automatically generated. You should not change it !!!
${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n  ')}${componentName === 'Timeline' ? '\nimport { XYComponentConfigInterface, StringAccessor } from "@unovis/ts"' : ''}
import { onMounted, onUnmounted, computed, ref, watch, nextTick${isStandAlone ? '' : ', inject'} } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
${isStandAlone ? '' : `import { ${elementSuffix}AccessorKey } from '../../utils/context'\n`}
${isStandAlone ? '' : `const accessor = inject(${elementSuffix}AccessorKey)\n`}
// data and required props ${isComplexPropComponent ? '\n// !!! temporary solution to ignore complex type. related issue: https://github.com/vuejs/core/issues/8412' : ''}
${isComplexPropComponent ? `interface Props extends /** @vue-ignore */ ${componentName}ConfigInterface${genericsStr} { }` : `type Props = ${componentName}ConfigInterface${genericsStr}`}
const props = defineProps<Props & { data?: ${dataType} }>()

${propDefs.length && !isStandAlone ? `${propDefs.join('\n')}` : isStandAlone ? 'const data = computed(() => props.data)' : ''}
// config
const config = useForwardProps(props)

// component declaration
const component = ref<${componentType}>()
${isStandAlone ? 'const elRef = ref<HTMLDivElement>()' : ''}

onMounted(() => {
  nextTick(() => {
    ${isStandAlone ? 'if(elRef.value)\n    ' : ''}component.value = new ${componentType}(${constructorArgs})
    ${propDefs?.length && !isStandAlone ? 'component.value?.setData(data.value)' : ''}
    ${isStandAlone ? '' : 'accessor.update(component.value)'}
  })
})

onUnmounted(() => {
  component.value?.destroy()
  ${isStandAlone ? '' : `accessor.destroy(${elementSuffix === 'axis' ? 'props.type' : ''})`}
})

watch(config, (curr, prev) => {
  if (!arePropsEqual(curr, prev)) {
    component.value?.setConfig(config.value)
  }
})
${propDefs?.length ? `\nwatch(data, () => {
  component.value?.setData(data.value)
})` : ''}

defineExpose({
  component
})
</script>

<script lang="ts">
export const Vis${componentName}Selectors = ${componentName}.selectors
</script>

<template>
  <div data-vis-${elementSuffix} ${isStandAlone ? 'ref="elRef"' : ''}/>
</template>

${isStandAlone ? `\n<style>\n  [data-vis-${elementSuffix}] {\n    ${styles?.join(';\n    ')};\n  }\n</style>` : ''}
`
}
