import { SvelteComponent } from "svelte";
import { Donut, NumericAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        value: NumericAccessor<Datum>;
        getComponent?: () => Donut<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type DonutProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type DonutEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type DonutSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Donut<Datum> extends SvelteComponent<DonutProps<Datum>, DonutEvents<Datum>, DonutSlots<Datum>> {
    get getComponent(): () => Donut<Datum>;
}
export {};
