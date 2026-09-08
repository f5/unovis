import { SvelteComponent } from "svelte";
import { Plotline } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        getComponent?: () => Plotline<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type PlotlineProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type PlotlineEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type PlotlineSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Plotline<Datum> extends SvelteComponent<PlotlineProps<Datum>, PlotlineEvents<Datum>, PlotlineSlots<Datum>> {
    get getComponent(): () => Plotline<Datum>;
}
export {};
