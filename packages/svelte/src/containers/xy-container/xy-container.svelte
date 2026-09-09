<script lang="ts">
  import { XYContainer, XYComponentCore, XYContainerConfigInterface, XYContainerRenderPayload, Tooltip, Crosshair, Axis, Annotations } from '@unovis/ts'
  import { createEventDispatcher, onMount, setContext } from 'svelte'

  type Datum = $$Generic
  interface $$Props extends XYContainerConfigInterface<Datum> {
    data?: Datum[];
  }

  const dispatch = createEventDispatcher<{
    load: XYContainerRenderPayload;
    render: XYContainerRenderPayload;
    redraw: XYContainerRenderPayload;
  }>()

  let hasLoaded = false
  const handleRenderComplete: XYContainerConfigInterface<Datum>['onRenderComplete'] = (svg, margin, bleed, containerWidth, containerHeight, componentWidth, componentHeight) => {
    const userCallback = $$restProps.onRenderComplete as XYContainerConfigInterface<Datum>['onRenderComplete']
    userCallback?.(svg, margin, bleed, containerWidth, containerHeight, componentWidth, componentHeight)
    const payload: XYContainerRenderPayload = { svg, margin, bleed, containerWidth, containerHeight, componentWidth, componentHeight }
    dispatch('render', payload)
    if (hasLoaded) {
      dispatch('redraw', payload)
    } else {
      hasLoaded = true
      dispatch('load', payload)
    }
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
  const updateContainer = () => {
    // Filter destroyed components — removal order can leave stale refs that crash on update.
    config.components = config.components?.filter((e) => !e.isDestroyed())

    // No rAF in SSR.
    if (typeof requestAnimationFrame === 'undefined') {
      chart?.updateContainer({
        ...config,
        ...($$restProps as XYContainerConfigInterface<Datum>),
        onRenderComplete: handleRenderComplete,
      })

      return
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }

    // Coalesce sibling component pushes into a single frame.
    animationFrame = requestAnimationFrame(() => {
      chart?.updateContainer({
        ...config,
        ...($$restProps as XYContainerConfigInterface<Datum>),
        onRenderComplete: handleRenderComplete,
      })
      animationFrame = 0
    })
  }

  // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-floating-promises
  $: { config; $$restProps; updateContainer() }

  onMount(() => {
    chart = new XYContainer(ref, { ...config, onRenderComplete: handleRenderComplete }, data)
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
