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

  let animationFrame = 0
  const updateContainer = async () => {
    // due to the order of events when a component is removed update container can be called
	  // while a component is being destroyed. This can lead to an error because we trigger an update
	  // with a destroyed component.
    config.components = config.components?.filter((e) => !e.isDestroyed())

    // we can't use animation frames in a non-browser environment
    if (typeof requestAnimationFrame === 'undefined') {
      chart?.updateContainer({
        ...config,
        ...($$restProps as XYContainerConfigInterface<Datum>),
      })

      return
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }

    // this prevent multiple renders from happening in a single frame
	  // when a component is first rendered the components will be pushed 1 by 1
	  // so we don't want to rerender every time a component is added
    animationFrame = requestAnimationFrame(() => {
      chart?.updateContainer({
        ...config,
        ...($$restProps as XYContainerConfigInterface<Datum>),
      })
      animationFrame = 0
    })
  }

  $: {
    config
    $$restProps
    updateContainer()
  }

  onMount(() => {
    chart = new XYContainer(ref, config, data)
    return () => chart.destroy()
  })

  setContext('component', () => ({
    update: (c: XYComponentCore<Datum>) => {
      if (config.components?.includes(c)) return
      config.components = [...config.components, c]
    },
    destroy: () => { config.components = config.components.filter(c => !c.isDestroyed()) },
  }))
  setContext('axis', (e: HTMLElement & { __type__?: 'x' | 'y'}) => ({
    update: (c: Axis<Datum>) => {
      if (config[`${e.__type__}Axis`] === c) return
      e.__type__ = c.config.type as 'x' | 'y'
      config[`${e.__type__}Axis`] = c
    },
    destroy: () => { config[`${e.__type__}Axis`] = undefined },
  }))
  setContext('crosshair', () => ({
    update: (c: Crosshair<Datum>) => {
      if (config.crosshair === c) return
      config.crosshair = c
    },
    destroy: () => { config.crosshair = undefined },
  }))
  setContext('tooltip', () => ({
    update: (t: Tooltip) => {
      if (config.tooltip === t) return
      config.tooltip = t
    },
    destroy: () => { config.tooltip = undefined },
  }))
  setContext('annotations', () => ({
    update: (a: Annotations) => {
      if (config.annotations === a) return
      config.annotations = a
    },
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
