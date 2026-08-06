<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Timeline } from '@unovis/ts/components/timeline'
  import type { TimelineConfigInterface } from '@unovis/ts/components/timeline/config'
  import type { NumericAccessor } from '@unovis/ts/types/accessor'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let x: NumericAccessor<Datum>

  // config
  let prevConfig: TimelineConfigInterface<Datum>
  let config: TimelineConfigInterface<Datum>
  $: config = { x, ...$$restProps }

  // component declaration
  let component: Timeline<Datum>
  const lifecycle = getContext<Lifecycle>('component')

  onMount(() => {
    component = new Timeline<Datum>(config)
    return () => component?.destroy()
  })
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Timeline<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

