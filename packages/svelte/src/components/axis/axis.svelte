<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Axis, AxisConfigInterface } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'

  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined

  // config
  let prevConfig: AxisConfigInterface<Datum>
  let config: AxisConfigInterface<Datum>
  $: config = { ...$$restProps }

  // component declaration
  let component: Axis<Datum>
  const { setAxis } = getContext('container')

  onMount(() => {
    component = new Axis<Datum>(config)
    setAxis(component)
    return () => { setAxis(undefined) as void }
  })

  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Axis<Datum> { return component }

</script>

<vis-axis/>

