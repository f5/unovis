<script lang="ts">
  import { XYContainer, XYComponentCore, XYContainerConfigInterface, Tooltip, Crosshair, Axis, Annotations } from '@unovis/ts'
  import { onMount, setContext } from 'svelte'

  type Datum = $$Generic
  interface $$Props extends XYContainerConfigInterface<Datum> {
    data?: Datum[];
  }

  // Props
  export let data: Datum[] = undefined
  export let className = ''
  /**
   * CSS class string. Requires `:global` modifier to take effect. _i.e._
   * ```css
   * div :global(.chart) { }
   * ```
   * @example
   * <div>
   *     <VisXYContainer class='chart'>
   *        ...
   *     <VisXYContainer>
   * </div>
   *
   * @see {@link https://svelte.dev/docs/svelte-components#styles}
  */
  export { className as class }

  let chart: XYContainer<Datum>
  const config: XYContainerConfigInterface<Datum> = {
    components: [],
    crosshair: undefined,
    tooltip: undefined,
    xAxis: undefined,
    yAxis: undefined,
    annotations: undefined,
  }
  let ref: HTMLDivElement

  $: chart?.setData(data, true)
  $: chart?.updateContainer({ ...config, ...($$restProps as XYContainerConfigInterface<Datum>) })

  onMount(() => {
    chart = new XYContainer(ref, config, data)
    return () => chart.destroy()
  })

  setContext('component', () => ({
    update: (c: XYComponentCore<Datum>) => {
      if (config.components?.some((e) => e === c)) return
      config.components = [...config.components, c]
    },
    destroy: () => { config.components = config.components.filter(c => !c.isDestroyed()) },
  }))
  setContext('axis', (e: HTMLElement & { __type__?: 'x' | 'y'}) => ({
    update: (c: Axis<Datum>) => {
      e.__type__ = c.config.type as 'x' | 'y'
      config[`${e.__type__}Axis`] = c
    },
    destroy: () => { config[`${e.__type__}Axis`] = undefined },
  }))
  setContext('crosshair', () => ({
    update: (c: Crosshair<Datum>) => { config.crosshair = c },
    destroy: () => { config.crosshair = undefined },
  }))
  setContext('tooltip', () => ({
    update: (t: Tooltip) => { config.tooltip = t },
    destroy: () => { config.tooltip = undefined },
  }))
  setContext('annotations', () => ({
    update: (a: Annotations) => { config.annotations = a },
    destroy: () => { config.annotations = undefined },
  }))
</script>

<vis-xy-container bind:this={ref} class={`unovis-xy-container ${className}`}>
  <slot />
</vis-xy-container>


<style>
  .unovis-xy-container {
    display: block;
    position: relative;
    width: 100%;
  }
</style>
