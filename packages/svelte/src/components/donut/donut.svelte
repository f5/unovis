<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Donut, DonutConfigInterface, NumericAccessor } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'

  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let value: NumericAccessor<Datum>

  // config
  let prevConfig: DonutConfigInterface<Datum>
  let config: DonutConfigInterface<Datum>
  $: config = { value, ...$$restProps }

  // component declaration
  let component: Donut<Datum>
  const { setComponent, removeComponent } = getContext('container')

  onMount(() => {
    component = new Donut<Datum>(config)
    setComponent(component)
    return () => { removeComponent(component) as void }
  })

  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Donut<Datum> { return component }

</script>

<vis-component/>

