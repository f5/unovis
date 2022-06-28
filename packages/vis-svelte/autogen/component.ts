import { ConfigProperty, GenericParameter } from './types'

const exportMethods = `\n  // public methods
  export function zoomIn (increment = 1): void { component.zoomIn(increment) }
  export function zoomOut (increment = 1): void { component.zoomOut(increment) }
  export function setZoom (zoomLevel: number) { component.setZoom(zoomLevel) }
  export function fitView (): void { component.fitView() }
`
export function getComponentCode (
  componentName: string,
  generics: GenericParameter[] | undefined,
  requiredProps: ConfigProperty[],
  importStatements: { source: string; elements: string[] }[],
  dataType: string | null = 'Data',
  elementSuffix = 'component',
  isStandAlone = false,
  exportsFunctions = false
): string {
  const genericsStr = generics ? `<${generics?.map(g => g.name).join(', ')}>` : ''
  const setterStr = `set${elementSuffix.charAt(0).toUpperCase()}${elementSuffix.substring(1)}`
  const configType = `${componentName}ConfigInterface${genericsStr}`
  const typeDefs = generics ? generics.map(g => `type ${g.name} = $$Generic${g.extends ? `<${g.extends}>` : ''}`) : []
  const onDestroy = elementSuffix === 'component' ? 'removeComponent(component)' : `${setterStr}(undefined)`
  const props = requiredProps.map(c => `export let ${c.name}: ${c.type}`)
  const propDefs = dataType ? [`export let data: ${dataType} = undefined`, ...props] : props
  return `<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  ${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n  ')}
  import { ${!isStandAlone ? 'getContext, ' : ''}onMount } from 'svelte'
  import { getActions } from '../../utils/actions'
  ${typeDefs.length ? `\n  // type defs\n  ${typeDefs.join('\n  ')}` : ''}

  let config: ${configType}
  $: config = {${requiredProps.map(c => ` ${c.name},`).join(' ')} ...$$restProps }

  // component declaration
  ${isStandAlone ? 'let' : 'const'} component${isStandAlone ? ': ' : ' = new '}${componentName}${genericsStr}${!isStandAlone ? '(config)' : ''}
  ${isStandAlone ? 'let ref: HTMLDivElement' : `const { ${setterStr}${elementSuffix === 'component' ? ', removeComponent' : ''} } = getContext('container')`}
  const { setConfig${dataType ? ', setData' : ''} } = getActions.apply(${isStandAlone ? `{
    setConfig: (c: ${configType}) => component?.${dataType ? 'setConfig' : 'update'}(c),${dataType ? `
    setData: (d: ${dataType}) => component?.setData(d),` : ''}
    render: () => component?.render()
  }` : 'component'})
  ${propDefs.length ? `// data and required props\n  ${propDefs.join('\n  ')}` : ''}${exportsFunctions ? exportMethods : ''}
  onMount(() => {
   ${isStandAlone ? `component = new ${componentName}${genericsStr}(ref, config${dataType ? ', data' : ''})` : `${setterStr}(component)`}
   return () => ${isStandAlone ? 'component.destroy()' : onDestroy} as void
  })
  
</script>

<vis-${elementSuffix}${isStandAlone ? ' bind:this={ref} style:display=\'block\'' : ''}${dataType ? ' use:setData={data}' : ''} use:setConfig={config} />
`
}
