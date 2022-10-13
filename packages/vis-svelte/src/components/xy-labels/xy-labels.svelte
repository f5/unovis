<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { XYLabels, XYLabelsConfigInterface, NumericAccessor } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'

  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum>

  // config
  let prevConfig: XYLabelsConfigInterface<Datum>
  let config: XYLabelsConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  // component declaration
  let component: XYLabels<Datum>
  const { setComponent, removeComponent } = getContext('container')

  onMount(() => {
    component = new XYLabels<Datum>(config)
    setComponent(component)
    return () => { removeComponent(component) as void }
  })

  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): XYLabels<Datum> { return component }

</script>

<vis-component/>

