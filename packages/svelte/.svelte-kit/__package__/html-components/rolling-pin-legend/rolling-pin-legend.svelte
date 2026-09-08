<script>// !!! This code was automatically generated. You should not change it !!!
import { RollingPinLegend } from '@unovis/ts';
import { onMount } from 'svelte';
import { arePropsEqual } from '../../utils/props';
// data and required props
// eslint-disable-next-line no-undef-init
export let rects;
// config
let prevConfig;
let config;
$: config = Object.assign({ rects }, $$restProps);
// component declaration
let component;
let ref;
onMount(() => {
    component = new RollingPinLegend(ref, config);
    return () => component === null || component === void 0 ? void 0 : component.destroy();
});
$: if (!arePropsEqual(prevConfig, config)) {
    component === null || component === void 0 ? void 0 : component.setConfig(config);
    prevConfig = config;
}
// component accessor
export function getComponent() { return component; }
</script>

<vis-rolling-pin-legend bind:this={ref}/>

<style>
  vis-rolling-pin-legend {
    display:block;
  }
</style>
