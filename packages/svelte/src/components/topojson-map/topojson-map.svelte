<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { TopoJSONMap, TopoJSONMapConfigInterface } from '@unovis/ts'
  import { getContext, onDestroy } from 'svelte'

  import type { Lifecycle } from '../../utils/context'
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
  const component = new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>(config)
  const lifecycle = getContext<Lifecycle>('container')

  onDestroy(() => component.destroy())
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): TopoJSONMap<AreaDatum, PointDatum, LinkDatum> { return component }

</script>

<vis-component use:lifecycle={component}/>

