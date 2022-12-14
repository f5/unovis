<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Brush, BrushConfigInterface } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'

  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined

  // config
  let prevConfig: BrushConfigInterface<Datum>
  let config: BrushConfigInterface<Datum>
  $: config = { ...$$restProps }

  // component declaration
  let component: Brush<Datum>
  const { setComponent, removeComponent } = getContext('container')

  onMount(() => {
    component = new Brush<Datum>(config)
    setComponent(component)
    return () => { removeComponent(component) as void }
  })

  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Brush<Datum> { return component }

</script>

<vis-component/>

