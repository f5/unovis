import { SvelteComponent } from "svelte";
import { Area, NumericAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        x: NumericAccessor<Datum>;
        y: NumericAccessor<Datum> | NumericAccessor<Datum>[];
        getComponent?: () => Area<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type AreaProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type AreaEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type AreaSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Area<Datum> extends SvelteComponent<AreaProps<Datum>, AreaEvents<Datum>, AreaSlots<Datum>> {
    get getComponent(): () => Area<Datum>;
}
export {};
