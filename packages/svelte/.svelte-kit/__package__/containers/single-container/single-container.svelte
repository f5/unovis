<script>import { SingleContainer } from '@unovis/ts';
import { arePropsEqual } from '../../utils/props';
import { onDestroy, setContext } from 'svelte';
// Internal variables
let chart;
let ref;
let component;
let tooltip;
let annotations;
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
 *     <VisSingleContainer class='chart'>
 *        ...
 *     </VisSingleContainer>
 * </div>
 *
 * @see {@link https://svelte.dev/docs/svelte-components#styles}
*/
export { className as class };
let config;
$: props = $$restProps;
$: config = Object.assign({ component, tooltip, annotations }, props);
// Helpers
function initChart() {
    chart = new SingleContainer(ref, config, data);
}
function updateChart(forceUpdate = false) {
    if (forceUpdate)
        chart === null || chart === void 0 ? void 0 : chart.update(config, null, data);
    else if (shouldUpdate)
        chart === null || chart === void 0 ? void 0 : chart.updateContainer(config);
    shouldUpdate = false;
}
// Reactive statements
$: chart === null || chart === void 0 ? void 0 : chart.setData(data);
$: shouldUpdate = Object.keys(props).some(k => !arePropsEqual(chart === null || chart === void 0 ? void 0 : chart.config[k], props[k]));
$: if (shouldUpdate)
    updateChart();
$: if (component)
    chart === undefined ? initChart() : updateChart(true);
// Lifecycle and contexts
// Child components call this after updating their data or config, so the chart re-renders.
// The render is scheduled on the next animation frame by the core, so multiple updates get batched
setContext('dirty', () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    chart === null || chart === void 0 ? void 0 : chart.render();
});
setContext('tooltip', () => ({
    update: (t) => { tooltip = t; },
    destroy: () => { tooltip = undefined; },
}));
setContext('component', () => ({
    update: (c) => { component = c; },
    destroy: () => { component = undefined; },
}));
setContext('annotations', () => ({
    update: (a) => { annotations = a; },
    destroy: () => { annotations = undefined; },
}));
onDestroy(() => chart === null || chart === void 0 ? void 0 : chart.destroy());
</script>

<vis-single-container bind:this={ref} class={`unovis-single-container ${className}`}>
  <slot/>
</vis-single-container>


<style>
  .unovis-single-container {
    display: block;
    position: relative;
    width: 100%;
  }
</style>
