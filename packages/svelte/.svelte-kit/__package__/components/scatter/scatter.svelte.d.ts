import { SvelteComponent } from "svelte";
import { Scatter, NumericAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        x: NumericAccessor<Datum>;
        y: NumericAccessor<Datum> | NumericAccessor<Datum>[];
        getComponent?: () => Scatter<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type ScatterProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type ScatterEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type ScatterSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Scatter<Datum> extends SvelteComponent<ScatterProps<Datum>, ScatterEvents<Datum>, ScatterSlots<Datum>> {
    get getComponent(): () => Scatter<Datum>;
}
export {};
