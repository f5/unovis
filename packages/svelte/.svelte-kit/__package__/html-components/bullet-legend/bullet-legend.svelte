<script>// !!! This code was automatically generated. You should not change it !!!
import { BulletLegend } from '@unovis/ts';
import { onMount } from 'svelte';
import { arePropsEqual } from '../../utils/props';
// data and required props
// eslint-disable-next-line no-undef-init
export let items;
// config
let prevConfig;
let config;
$: config = Object.assign({ items }, $$restProps);
// component declaration
let component;
let ref;
onMount(() => {
    component = new BulletLegend(ref, Object.assign(Object.assign({}, config), { renderIntoProvidedDomNode: true }));
    return () => component === null || component === void 0 ? void 0 : component.destroy();
});
$: if (!arePropsEqual(prevConfig, config)) {
    component === null || component === void 0 ? void 0 : component.setConfig(config);
    prevConfig = config;
}
// component accessor
export function getComponent() { return component; }
</script>

<vis-bullet-legend bind:this={ref}/>

<style>
  vis-bullet-legend {
    display:block;
  }
</style>
