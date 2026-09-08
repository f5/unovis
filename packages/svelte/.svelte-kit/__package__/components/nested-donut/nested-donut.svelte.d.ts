import { SvelteComponent } from "svelte";
import { NestedDonut, StringAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        layers: StringAccessor<Datum>[];
        getComponent?: () => NestedDonut<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type NestedDonutProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type NestedDonutEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type NestedDonutSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class NestedDonut<Datum> extends SvelteComponent<NestedDonutProps<Datum>, NestedDonutEvents<Datum>, NestedDonutSlots<Datum>> {
    get getComponent(): () => NestedDonut<Datum>;
}
export {};
