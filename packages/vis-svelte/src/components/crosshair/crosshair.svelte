<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Crosshair, CrosshairConfigInterface, NumericAccessor } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { emptyCallback, getActions } from '../../utils/actions'

  // type defs
  type Datum = $$Generic

  let config: CrosshairConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  // component declaration
  let component: Crosshair<Datum>
  const { setCrosshair } = getContext('container')

  let setConfig = emptyCallback
  let setData = emptyCallback

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  onMount(() => {
    component = new Crosshair<Datum>(config)
    const actions = getActions.apply(component)
    setConfig = actions.setConfig
    setData = actions.setData
    setCrosshair(component)

    return () => { setCrosshair(undefined) as void }
  })

  // component accessor
  export function getComponent (): Crosshair<Datum> { return component }

</script>

<vis-crosshair use:setData={data} use:setConfig={config} />

