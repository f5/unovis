<script>// !!! This code was automatically generated. You should not change it !!!
import { LeafletMap } from '@unovis/ts';
import { onMount } from 'svelte';
import { arePropsEqual } from '../../utils/props';
// data and required props
// eslint-disable-next-line no-undef-init
export let data = undefined;
export let style;
// config
let prevConfig;
let config;
$: config = Object.assign({ style }, $$restProps);
// component declaration
let component;
let ref;
onMount(() => {
    component = new LeafletMap(ref, config, data);
    return () => component === null || component === void 0 ? void 0 : component.destroy();
});
$: component === null || component === void 0 ? void 0 : component.setData(data);
$: if (!arePropsEqual(prevConfig, config)) {
    component === null || component === void 0 ? void 0 : component.setConfig(config);
    prevConfig = config;
}
// component accessor
export function getComponent() { return component; }
</script>

<vis-leaflet-map bind:this={ref}/>

<style>
  vis-leaflet-map {
    display:block;
    position:relative;
  }
</style>
