import { SvelteComponent } from "svelte";
import { BulletLegend, BulletLegendItemInterface } from '@unovis/ts';
declare const __propDef: {
    props: {
        [x: string]: any;
        items: BulletLegendItemInterface[];
        getComponent?: () => BulletLegend;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {};
    bindings?: string;
};
export type BulletLegendProps = typeof __propDef.props;
export type BulletLegendEvents = typeof __propDef.events;
export type BulletLegendSlots = typeof __propDef.slots;
export default class BulletLegend extends SvelteComponent<BulletLegendProps, BulletLegendEvents, BulletLegendSlots> {
    get getComponent(): () => BulletLegend;
}
export {};
