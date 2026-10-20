<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Timeline as TimelineCore } from '@unovis/ts/components/timeline'
  import type { TimelineConfigInterface } from '@unovis/ts/components/timeline/config'
  import type { NumericAccessor } from '@unovis/ts/types/accessor'
  import { cloneDeep } from '@unovis/ts/utils/data'
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
  let component: TimelineCore<Datum>
  const lifecycle = getContext<Lifecycle>('component')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new TimelineCore<Datum>(config)
    return () => component?.destroy()
  })
  $: if (data !== undefined) { component?.setData(data); dirty?.() }
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
    // Refresh the container action when configuration changes
    component = component
    dirty?.()
  }

  // component accessor
  export function getComponent (): TimelineCore<Datum> { return component }

</script>

<vis-component use:lifecycle={component}></vis-component>

