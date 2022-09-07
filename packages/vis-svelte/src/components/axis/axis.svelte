<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Axis, AxisConfigInterface, NumericAccessor } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  // type defs
  type Datum = $$Generic

  let config: AxisConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  // component declaration
  const component = new Axis<Datum>(config)
  const { setAxis } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)
  // data and required props
  export let data: Datum[]
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]
  onMount(() => {
    setAxis(component)
    return () => setAxis(undefined) as void
  })

</script>

<vis-axis use:setData={data} use:setConfig={config} />
