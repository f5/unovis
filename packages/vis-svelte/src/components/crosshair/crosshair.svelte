<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Crosshair, CrosshairConfigInterface, NumericAccessor } from '@volterra/vis'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  type Datum = $$Generic

  // data and required props
  export let data: Datum[]
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  let config: CrosshairConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  const component = new Crosshair<Datum>()

  const { setCrosshair } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)

  onMount(() => {
    setCrosshair(component)

    return () => setCrosshair(undefined) as void
  })
</script>

<vis-crosshair use:setData={data} use:setConfig={config} />
