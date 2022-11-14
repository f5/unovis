<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Crosshair, CrosshairConfigInterface, NumericAccessor } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'

  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  // config
  let prevConfig: CrosshairConfigInterface<Datum>
  let config: CrosshairConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  // component declaration
  let component: Crosshair<Datum>
  const { setCrosshair } = getContext('container')

  onMount(() => {
    component = new Crosshair<Datum>(config)
    setCrosshair(component)
    return () => { setCrosshair(undefined) as void }
  })

  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Crosshair<Datum> { return component }

</script>

<vis-crosshair/>

