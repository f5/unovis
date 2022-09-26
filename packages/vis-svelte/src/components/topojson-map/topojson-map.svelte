<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { TopoJSONMap, TopoJSONMapConfigInterface } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  // type defs
  type AreaDatum = $$Generic
  type PointDatum = $$Generic
  type LinkDatum = $$Generic

  let config: TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>
  $: config = { ...$$restProps }

  // component declaration
  const component = new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>(config)
  const { setComponent, removeComponent } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)
  // data and required props
  export let data: {areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]}
  onMount(() => {
    setComponent(component)
    return () => removeComponent(component) as void
  })

  // component accessor
  export function getComponent (): TopoJSONMap<AreaDatum, PointDatum, LinkDatum> { return component }

</script>

<vis-component use:setData={data} use:setConfig={config} />

