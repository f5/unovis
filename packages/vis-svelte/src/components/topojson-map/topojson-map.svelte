<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { TopoJSONMap, TopoJSONMapConfigInterface } from '@volterra/vis'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  type AreaDatum = $$Generic
  type PointDatum = $$Generic
  type LinkDatum = $$Generic

  // data and required props
  export let data: {areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]}


  let config: TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>
  $: config = { ...$$restProps }

  const component = new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>()

  const { setComponent, removeComponent } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)

  onMount(() => {
    setComponent(component)

    return () => removeComponent(component) as void
  })
</script>

<vis-component use:setData={data} use:setConfig={config} />
