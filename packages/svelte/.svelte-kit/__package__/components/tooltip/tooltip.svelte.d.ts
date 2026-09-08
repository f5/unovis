import { SvelteComponent } from "svelte";
import { Tooltip } from '@unovis/ts';
declare const __propDef: {
    props: {
        [x: string]: any;
        getComponent?: () => Tooltip;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {};
    bindings?: string;
};
export type TooltipProps = typeof __propDef.props;
export type TooltipEvents = typeof __propDef.events;
export type TooltipSlots = typeof __propDef.slots;
export default class Tooltip extends SvelteComponent<TooltipProps, TooltipEvents, TooltipSlots> {
    get getComponent(): () => Tooltip;
}
export {};
