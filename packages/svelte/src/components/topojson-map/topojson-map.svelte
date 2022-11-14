<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { TopoJSONMap, TopoJSONMapConfigInterface } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'

  // type defs
  type AreaDatum = $$Generic
  type PointDatum = $$Generic
  type LinkDatum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: {areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]} = undefined

  // config
  let prevConfig: TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>
  let config: TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>
  $: config = { ...$$restProps }

  // component declaration
  let component: TopoJSONMap<AreaDatum, PointDatum, LinkDatum>
  const { setComponent, removeComponent } = getContext('container')

  onMount(() => {
    component = new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>(config)
    setComponent(component)
    return () => { removeComponent(component) as void }
  })

  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): TopoJSONMap<AreaDatum, PointDatum, LinkDatum> { return component }

</script>

<vis-component/>

