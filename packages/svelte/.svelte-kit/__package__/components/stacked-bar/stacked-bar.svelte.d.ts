import { SvelteComponent } from "svelte";
import { StackedBar, NumericAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        x: NumericAccessor<Datum>;
        y: NumericAccessor<Datum> | NumericAccessor<Datum>[];
        getComponent?: () => StackedBar<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type StackedBarProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type StackedBarEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type StackedBarSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class StackedBar<Datum> extends SvelteComponent<StackedBarProps<Datum>, StackedBarEvents<Datum>, StackedBarSlots<Datum>> {
    get getComponent(): () => StackedBar<Datum>;
}
export {};
