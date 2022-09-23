<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Crosshair, CrosshairConfigInterface, NumericAccessor } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  // type defs
  type Datum = $$Generic

  let config: CrosshairConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  // component declaration
  const component = new Crosshair<Datum>(config)
  const { setCrosshair } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)
  // data and required props
  export let data: Datum[]
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]
  onMount(() => {
    setCrosshair(component)
    return () => setCrosshair(undefined) as void
  })

  // component accessor
  export function getComponent (): Crosshair<Datum> { return component }

</script>

<vis-crosshair use:setData={data} use:setConfig={config} />

