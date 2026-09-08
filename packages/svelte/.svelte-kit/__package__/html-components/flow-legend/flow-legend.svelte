<script>// !!! This code was automatically generated. You should not change it !!!
import { FlowLegend } from '@unovis/ts';
import { onMount } from 'svelte';
import { arePropsEqual } from '../../utils/props';
// config
let prevConfig;
let config;
$: config = Object.assign({}, $$restProps);
// component declaration
let component;
let ref;
onMount(() => {
    component = new FlowLegend(ref, Object.assign(Object.assign({}, config), { renderIntoProvidedDomNode: true }));
    return () => component === null || component === void 0 ? void 0 : component.destroy();
});
$: if (!arePropsEqual(prevConfig, config)) {
    component === null || component === void 0 ? void 0 : component.setConfig(config);
    prevConfig = config;
}
// component accessor
export function getComponent() { return component; }
</script>

<vis-flow-legend bind:this={ref}/>

<style>
  vis-flow-legend {
    display:block;
  }
</style>
