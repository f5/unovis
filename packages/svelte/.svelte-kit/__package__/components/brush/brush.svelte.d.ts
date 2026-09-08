import { SvelteComponent } from "svelte";
import { Brush } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        getComponent?: () => Brush<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type BrushProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type BrushEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type BrushSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Brush<Datum> extends SvelteComponent<BrushProps<Datum>, BrushEvents<Datum>, BrushSlots<Datum>> {
    get getComponent(): () => Brush<Datum>;
}
export {};
