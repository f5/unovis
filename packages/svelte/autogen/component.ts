import { ConfigProperty, GenericParameter } from './types'

export function getComponentCode (
  componentName: string,
  generics: GenericParameter[] | undefined,
  requiredProps: ConfigProperty[],
  importStatements: { source: string; elements: string[] }[],
  dataType: string | null = 'Data',
  elementSuffix = 'component',
  isStandAlone = false,
  styles?: string[]
): string {
  const genericsStr = generics ? `<${generics?.map(g => g.name).join(', ')}>` : ''
  const configType = `${componentName}ConfigInterface${genericsStr}`
  const typeDefs = generics ? generics.map(g => `type ${g.name} = $$Generic${g.extends ? `<${g.extends}>` : ''}`) : []
  const props = requiredProps.map(c => `export let ${c.name}: ${c.type}`)
  const propDefs = dataType ? [`export let data: ${dataType} = undefined`, ...props] : props
  const componentType = [componentName, genericsStr].join('')
  const componentInit = `${componentType}(${isStandAlone ? `ref, config${dataType ? ', data' : ''}` : 'config'})`
  const lifecycleMethod = isStandAlone
    ? ['onMount(() => {', `component = new ${componentInit}`, 'return () => component.destroy()', '})'].join('\n    ')
    : 'onDestroy(() => component.destroy())'
  return `<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  ${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n  ')}
  import { ${isStandAlone ? 'onMount' : 'getContext, onDestroy'} } from 'svelte'
  ${!isStandAlone ? '\n  import type { Lifecycle } from \'../../utils/context\'' : ''}
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
  ${isStandAlone ? 'let' : 'const'} component${isStandAlone ? `: ${componentType}` : `= new ${componentInit}`}
  ${isStandAlone ? 'let ref: HTMLDivElement' : 'const lifecycle = getContext<Lifecycle>(\'container\')'}

  ${lifecycleMethod}${dataType ? '\n  $: component?.setData(data)' : ''}
  $: if(!arePropsEqual(prevConfig, config)) {
    component?.${componentName === 'BulletLegend' ? 'update' : 'setConfig'}(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): ${componentName}${genericsStr} { return component }

</script>

<vis-${elementSuffix} ${isStandAlone ? 'bind:this={ref}' : 'use:lifecycle={component}'}/>
${isStandAlone ? `\n<style>\n  vis-${elementSuffix} {\n    ${styles?.join(';\n    ')};\n  }\n</style>` : ''}
`
}
