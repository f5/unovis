import { SvelteComponent } from "svelte";
import { GroupedBar, NumericAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        x: NumericAccessor<Datum>;
        y: NumericAccessor<Datum> | NumericAccessor<Datum>[];
        getComponent?: () => GroupedBar<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type GroupedBarProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type GroupedBarEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type GroupedBarSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class GroupedBar<Datum> extends SvelteComponent<GroupedBarProps<Datum>, GroupedBarEvents<Datum>, GroupedBarSlots<Datum>> {
    get getComponent(): () => GroupedBar<Datum>;
}
export {};
