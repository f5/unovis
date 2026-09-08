<script>import { XYContainer } from '@unovis/ts';
import { onMount, setContext } from 'svelte';
// Props
export let data = undefined;
export let className = '';
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
export { className as class };
let chart;
const config = {
    components: [],
    crosshair: undefined,
    tooltip: undefined,
    xAxis: undefined,
    yAxis: undefined,
    annotations: undefined,
};
let ref;
$: chart === null || chart === void 0 ? void 0 : chart.setData(data, true);
let animationFrame = 0;
const updateContainer = () => {
    var _a;
    // due to the order of events when a component is removed update container can be called
    // while a component is being destroyed. This can lead to an error because we trigger an update
    // with a destroyed component.
    config.components = (_a = config.components) === null || _a === void 0 ? void 0 : _a.filter((e) => !e.isDestroyed());
    // we can't use animation frames in a non-browser environment
    if (typeof requestAnimationFrame === 'undefined') {
        chart === null || chart === void 0 ? void 0 : chart.updateContainer(Object.assign(Object.assign({}, config), $$restProps));
        return;
    }
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    // this prevent multiple renders from happening in a single frame
    // when a component is first rendered the components will be pushed 1 by 1
    // so we don't want to rerender every time a component is added
    animationFrame = requestAnimationFrame(() => {
        chart === null || chart === void 0 ? void 0 : chart.updateContainer(Object.assign(Object.assign({}, config), $$restProps));
        animationFrame = 0;
    });
};
$: {
    // Referencing `config` and `$$restProps` makes this reactive statement re-run when they change
    // eslint-disable-next-line no-unused-expressions
    config;
    // eslint-disable-next-line no-unused-expressions
    $$restProps;
    updateContainer();
}
onMount(() => {
    chart = new XYContainer(ref, config, data);
    return () => chart.destroy();
});
// Child components call this after updating their data or config, so the chart re-renders.
// The render is scheduled on the next animation frame by the core, so multiple updates get batched
setContext('dirty', () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    chart === null || chart === void 0 ? void 0 : chart.render();
});
setContext('component', () => ({
    update: (c) => {
        var _a;
        if ((_a = config.components) === null || _a === void 0 ? void 0 : _a.includes(c))
            return;
        config.components = [...config.components, c];
    },
    destroy: () => { config.components = config.components.filter(c => !c.isDestroyed()); },
}));
setContext('axis', (e) => ({
    update: (c) => {
        if (config[`${e.__type__}Axis`] === c)
            return;
        e.__type__ = c.config.type;
        config[`${e.__type__}Axis`] = c;
    },
    destroy: () => { config[`${e.__type__}Axis`] = undefined; },
}));
setContext('crosshair', () => ({
    update: (c) => {
        if (config.crosshair === c)
            return;
        config.crosshair = c;
    },
    destroy: () => { config.crosshair = undefined; },
}));
setContext('tooltip', () => ({
    update: (t) => {
        if (config.tooltip === t)
            return;
        config.tooltip = t;
    },
    destroy: () => { config.tooltip = undefined; },
}));
setContext('annotations', () => ({
    update: (a) => {
        if (config.annotations === a)
            return;
        config.annotations = a;
    },
    destroy: () => { config.annotations = undefined; },
}));
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
