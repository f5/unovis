import { SvelteComponent } from "svelte";
import { Treemap, StringAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        layers: StringAccessor<Datum>[];
        getComponent?: () => Treemap<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type TreemapProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type TreemapEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type TreemapSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Treemap<Datum> extends SvelteComponent<TreemapProps<Datum>, TreemapEvents<Datum>, TreemapSlots<Datum>> {
    get getComponent(): () => Treemap<Datum>;
}
export {};
