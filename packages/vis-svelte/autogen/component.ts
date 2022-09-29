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
  import { emptyCallback, getActions } from '../../utils/actions'
  ${typeDefs.length ? `\n  // type defs\n  ${typeDefs.join('\n  ')}` : ''}

  let config: ${configType}
  $: config = {${requiredProps.map(c => ` ${c.name},`).join(' ')} ...$$restProps }

  // component declaration
  let component: ${componentName}${genericsStr}
  ${isStandAlone ? 'let ref: HTMLDivElement' : `const { ${setterStr}${elementSuffix === 'component' ? ', removeComponent' : ''} } = getContext('container')`}

  let setConfig = emptyCallback
  ${dataType ? 'let setData = emptyCallback' : ''}
  ${propDefs.length ? `
   // data and required props
  // eslint-disable-next-line no-undef-init
   ${propDefs.join('\n  ')}
  ` : ''}
  onMount(() => {
    component = new ${componentName}${genericsStr}(${isStandAlone ? `ref, config${dataType ? ', data' : ''}` : 'config'})
    const actions = getActions.apply(${isStandAlone ? `{
      setConfig: (c: ${configType}) => { component?.${dataType ? 'setConfig' : 'update'}(c) },${dataType ? `
      setData: (d: ${dataType}) => { component?.setData(d) },` : ''}
      render: () => { component?.render() }
    }` : 'component'})
    setConfig = actions.setConfig
    ${dataType ? 'setData = actions.setData' : ''}
    ${isStandAlone ? '' : `${setterStr}(component)`}

    return () => { ${isStandAlone ? 'component.destroy() ' : onDestroy} as void }
  })

  // component accessor
  export function getComponent (): ${componentName}${genericsStr} { return component }

</script>

<vis-${elementSuffix}${isStandAlone ? ' bind:this={ref}' : ''}${dataType ? ' use:setData={data}' : ''} use:setConfig={config} />
${isStandAlone ? `\n<style>\n  vis-${elementSuffix} {\n    ${styles?.join(';\n    ')};\n  }\n</style>` : ''}
`
}
