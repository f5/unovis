import { SvelteComponent } from "svelte";
import { RollingPinLegend, RollingPinLegendItem } from '@unovis/ts';
declare const __propDef: {
    props: {
        [x: string]: any;
        rects: RollingPinLegendItem[];
        getComponent?: () => RollingPinLegend;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {};
    bindings?: string;
};
export type RollingPinLegendProps = typeof __propDef.props;
export type RollingPinLegendEvents = typeof __propDef.events;
export type RollingPinLegendSlots = typeof __propDef.slots;
export default class RollingPinLegend extends SvelteComponent<RollingPinLegendProps, RollingPinLegendEvents, RollingPinLegendSlots> {
    get getComponent(): () => RollingPinLegend;
}
export {};
