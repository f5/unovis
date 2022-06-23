<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Axis, AxisConfigInterface, NumericAccessor } from '@volterra/vis'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  type Datum = $$Generic

  // data and required props
  export let data: Datum[]
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  let config: AxisConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  const component = new Axis<Datum>()

  const { setAxis } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)

  onMount(() => {
    setAxis(component)

    return () => setAxis(undefined) as void
  })
</script>

<vis-axis use:setData={data} use:setConfig={config} />
