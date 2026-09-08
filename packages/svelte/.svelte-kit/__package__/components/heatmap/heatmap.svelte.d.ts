import { SvelteComponent } from "svelte";
import { Heatmap, NumericAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        value: NumericAccessor<Datum>;
        getComponent?: () => Heatmap<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type HeatmapProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type HeatmapEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type HeatmapSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Heatmap<Datum> extends SvelteComponent<HeatmapProps<Datum>, HeatmapEvents<Datum>, HeatmapSlots<Datum>> {
    get getComponent(): () => Heatmap<Datum>;
}
export {};
