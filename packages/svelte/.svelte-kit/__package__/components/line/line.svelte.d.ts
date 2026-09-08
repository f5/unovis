import { SvelteComponent } from "svelte";
import { Line, NumericAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        x: NumericAccessor<Datum>;
        y: NumericAccessor<Datum> | NumericAccessor<Datum>[];
        getComponent?: () => Line<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type LineProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type LineEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type LineSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Line<Datum> extends SvelteComponent<LineProps<Datum>, LineEvents<Datum>, LineSlots<Datum>> {
    get getComponent(): () => Line<Datum>;
}
export {};
