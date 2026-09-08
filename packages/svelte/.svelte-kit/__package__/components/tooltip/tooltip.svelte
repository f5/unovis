<script>// !!! This code was automatically generated. You should not change it !!!
import { Tooltip } from '@unovis/ts';
import { onMount, getContext } from 'svelte';
import { arePropsEqual } from '../../utils/props';
// config
let prevConfig;
let config;
$: config = Object.assign({}, $$restProps);
// component declaration
let component;
const lifecycle = getContext('tooltip');
// Notifies the container that this component's data or config has changed, so it can re-render
const dirty = getContext('dirty');
onMount(() => {
    component = new Tooltip(config);
    return () => component === null || component === void 0 ? void 0 : component.destroy();
});
$: if (!arePropsEqual(prevConfig, config)) {
    component === null || component === void 0 ? void 0 : component.setConfig(config);
    prevConfig = config;
    dirty === null || dirty === void 0 ? void 0 : dirty();
}
// component accessor
export function getComponent() { return component; }
</script>

<vis-tooltip use:lifecycle={component}/>

