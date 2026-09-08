import { SvelteComponent } from "svelte";
import { Boxplot, NumericAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        x: NumericAccessor<Datum>;
        getComponent?: () => Boxplot<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type BoxplotProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type BoxplotEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type BoxplotSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Boxplot<Datum> extends SvelteComponent<BoxplotProps<Datum>, BoxplotEvents<Datum>, BoxplotSlots<Datum>> {
    get getComponent(): () => Boxplot<Datum>;
}
export {};
