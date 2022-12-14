<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { FreeBrush, FreeBrushConfigInterface } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'

  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined

  // config
  let prevConfig: FreeBrushConfigInterface<Datum>
  let config: FreeBrushConfigInterface<Datum>
  $: config = { ...$$restProps }

  // component declaration
  let component: FreeBrush<Datum>
  const { setComponent, removeComponent } = getContext('container')

  onMount(() => {
    component = new FreeBrush<Datum>(config)
    setComponent(component)
    return () => { removeComponent(component) as void }
  })

  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): FreeBrush<Datum> { return component }

</script>

<vis-component/>

