<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Axis, AxisConfigInterface, NumericAccessor } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { emptyCallback, getActions } from '../../utils/actions'

  // type defs
  type Datum = $$Generic

  let config: AxisConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  // component declaration
  let component: Axis<Datum>
  const { setAxis } = getContext('container')

  let setConfig = emptyCallback
  let setData = emptyCallback

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  onMount(() => {
    component = new Axis<Datum>(config)
    const actions = getActions.apply(component)
    setConfig = actions.setConfig
    setData = actions.setData
    setAxis(component)

    return () => { setAxis(undefined) as void }
  })

  // component accessor
  export function getComponent (): Axis<Datum> { return component }

</script>

<vis-axis use:setData={data} use:setConfig={config} />

