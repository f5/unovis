<script>// !!! This code was automatically generated. You should not change it !!!
import { Graph } from '@unovis/ts';
import { onMount, getContext } from 'svelte';
import { arePropsEqual } from '../../utils/props';
// data and required props
// eslint-disable-next-line no-undef-init
export let data = undefined;
// config
let prevConfig;
let config;
$: config = Object.assign({}, $$restProps);
// component declaration
let component;
const lifecycle = getContext('component');
// Notifies the container that this component's data or config has changed, so it can re-render
const dirty = getContext('dirty');
onMount(() => {
    component = new Graph(config);
    return () => component === null || component === void 0 ? void 0 : component.destroy();
});
$: {
    component === null || component === void 0 ? void 0 : component.setData(data);
    dirty === null || dirty === void 0 ? void 0 : dirty();
}
$: if (!arePropsEqual(prevConfig, config)) {
    component === null || component === void 0 ? void 0 : component.setConfig(config);
    prevConfig = config;
    dirty === null || dirty === void 0 ? void 0 : dirty();
}
// component accessor
export function getComponent() { return component; }
</script>

<vis-component use:lifecycle={component}/>

