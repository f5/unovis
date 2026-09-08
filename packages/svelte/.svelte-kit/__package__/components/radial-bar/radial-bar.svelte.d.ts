import { SvelteComponent } from "svelte";
import { RadialBar, NumericAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        value: NumericAccessor<Datum>;
        getComponent?: () => RadialBar<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type RadialBarProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type RadialBarEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type RadialBarSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class RadialBar<Datum> extends SvelteComponent<RadialBarProps<Datum>, RadialBarEvents<Datum>, RadialBarSlots<Datum>> {
    get getComponent(): () => RadialBar<Datum>;
}
export {};
