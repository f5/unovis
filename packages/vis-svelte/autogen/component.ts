import { ConfigProperty, GenericParameter } from './types'

export function getComponentCode (
  componentName: string,
  generics: GenericParameter[] | undefined,
  requiredProps: ConfigProperty[],
  importStatements: { source: string; elements: string[] }[],
  dataType: string | null = 'any',
  elementSuffix = 'component'
): string {
  const genericsStr = generics ? `<${generics?.map(g => g.name).join(', ')}>` : ''
  const setterStr = `set${elementSuffix.charAt(0).toUpperCase()}${elementSuffix.substring(1)}`
  const genericsDef = generics ? `\n  ${generics?.map(g => `type ${g.name} = $$Generic${g.extends ? `<${g.extends}>` : ''}`).join('\n  ')}` : ''
  const dataDef = dataType ? `export let data: ${dataType} = undefined\n  ` : ''
  return `
<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  ${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n  ')}
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'
  ${genericsDef}

  // data and required props
  ${dataDef}${requiredProps.map(c => `export let ${c.name}: ${c.type}`).join('\n  ')}

  let config: ${componentName}ConfigInterface${genericsStr}
  $: config = {${requiredProps.map(c => ` ${c.name},`).join(' ')} ...$$restProps }

  const component = new ${componentName}${genericsStr}()

  const { ${setterStr}${elementSuffix === 'component' ? ', removeComponent' : ''} } = getContext('container')
  const { setConfig${dataType ? ', setData' : ''} } = getActions.apply(component)

  onMount(() => {
   ${setterStr}(component)
   
   return () => ${elementSuffix === 'component' ? 'removeComponent(component)' : `${setterStr}(undefined)`} as void
  })
</script>

<vis-${elementSuffix}${dataType ? ' use:setData={data}' : ''} use:setConfig={config} />
`
}
