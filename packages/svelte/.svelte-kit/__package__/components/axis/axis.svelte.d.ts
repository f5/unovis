import { SvelteComponent } from "svelte";
import { Axis } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        getComponent?: () => Axis<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type AxisProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type AxisEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type AxisSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Axis<Datum> extends SvelteComponent<AxisProps<Datum>, AxisEvents<Datum>, AxisSlots<Datum>> {
    get getComponent(): () => Axis<Datum>;
}
export {};
