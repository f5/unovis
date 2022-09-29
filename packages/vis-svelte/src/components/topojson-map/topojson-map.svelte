<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { TopoJSONMap, TopoJSONMapConfigInterface } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { emptyCallback, getActions } from '../../utils/actions'

  // type defs
  type AreaDatum = $$Generic
  type PointDatum = $$Generic
  type LinkDatum = $$Generic

  let config: TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>
  $: config = { ...$$restProps }

  // component declaration
  let component: TopoJSONMap<AreaDatum, PointDatum, LinkDatum>
  const { setComponent, removeComponent } = getContext('container')

  let setConfig = emptyCallback
  let setData = emptyCallback

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: {areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]} = undefined

  onMount(() => {
    component = new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>(config)
    const actions = getActions.apply(component)
    setConfig = actions.setConfig
    setData = actions.setData
    setComponent(component)

    return () => { removeComponent(component) as void }
  })

  // component accessor
  export function getComponent (): TopoJSONMap<AreaDatum, PointDatum, LinkDatum> { return component }

</script>

<vis-component use:setData={data} use:setConfig={config} />

