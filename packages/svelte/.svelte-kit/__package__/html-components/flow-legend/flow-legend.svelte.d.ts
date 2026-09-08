import { SvelteComponent } from "svelte";
import { FlowLegend } from '@unovis/ts';
declare const __propDef: {
    props: {
        [x: string]: any;
        getComponent?: () => FlowLegend;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {};
    bindings?: string;
};
export type FlowLegendProps = typeof __propDef.props;
export type FlowLegendEvents = typeof __propDef.events;
export type FlowLegendSlots = typeof __propDef.slots;
export default class FlowLegend extends SvelteComponent<FlowLegendProps, FlowLegendEvents, FlowLegendSlots> {
    get getComponent(): () => FlowLegend;
}
export {};
