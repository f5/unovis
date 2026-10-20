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
  const genericsStr = generics ? `<${generics?.map(g => g.name).join(', ')}>` : ''
  const configType = `${componentName}ConfigInterface${genericsStr}`
  const typeDefs = generics ? generics.map(g => `type ${g.name} = $$Generic${g.extends ? `<${g.extends}>` : ''}`) : []
  const props = requiredProps.map(c => `export let ${c.name}: ${c.type}`)
  const propDefs = dataType ? [`export let data: ${dataType} = undefined`, ...props] : props
  const componentClass = `${componentName}Core`
  const componentType = [componentClass, genericsStr].join('')
  const constructorArgs = isStandAlone
    ? `ref, ${renderIntoProvidedDomNode ? '{ ...config, renderIntoProvidedDomNode: true }' : 'config'}${dataType ? ', data' : ''}`
    : 'config'
  const lifecycleMethod = ['onMount(() => {', `component = new ${componentType}(${constructorArgs})`, 'return () => component?.destroy()', '})'].join('\n    ')
  const renderImport = (s: { source: string; elements: string[] }): string => {
    const keyword = s.elements.includes(componentName) ? 'import' : 'import type'
    const elements = s.elements.map(e => e === componentName ? `${e} as ${componentClass}` : e).join(', ')
    return `${keyword} { ${elements} } from '${s.source}'`
  }
  return `<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  ${importStatements.map(renderImport).join('\n  ')}
  import { cloneDeep } from '@unovis/ts/utils/data'
  import { onMount${isStandAlone ? '' : ', getContext'} } from 'svelte'
  ${!isStandAlone ? '\n  import type { Lifecycle } from \'../../types/context\'' : ''}
  import { arePropsEqual } from '../../utils/props'
  ${typeDefs.length ? `// type defs\n  ${typeDefs.join('\n  ')}` : ''}
  ${propDefs.length ? `
  // data and required props
  // eslint-disable-next-line no-undef-init\n${propDefs.join('\n  ')}\n` : ''}
  // config
  let prevConfig: ${configType}
  let config: ${configType}
  $: config = {${requiredProps.map(c => ` ${c.name},`).join(' ')} ...$$restProps }

  // component declaration
  let component: ${componentType}
  ${isStandAlone ? 'let ref: HTMLDivElement' : `const lifecycle = getContext<Lifecycle>('${elementSuffix}')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')`}

  ${lifecycleMethod}${dataType ? (isStandAlone ? '\n  $: if (data !== undefined) component?.setData(data)' : '\n  $: if (data !== undefined) { component?.setData(data); dirty?.() }') : ''}
  $: if(!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)${isStandAlone ? '' : '\n    // Refresh the container action when configuration changes\n    component = component\n    dirty?.()'}
  }

  // component accessor
  export function getComponent (): ${componentClass}${genericsStr} { return component }

</script>

<vis-${elementSuffix} ${isStandAlone ? 'bind:this={ref}' : 'use:lifecycle={component}'}></vis-${elementSuffix}>
${isStandAlone ? `\n<style>\n  vis-${elementSuffix} {\n    ${styles?.join(';\n    ')};\n  }\n</style>` : ''}
`
}
