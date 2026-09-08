import { SvelteComponent } from "svelte";
import { Plotband } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        getComponent?: () => Plotband<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type PlotbandProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type PlotbandEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type PlotbandSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Plotband<Datum> extends SvelteComponent<PlotbandProps<Datum>, PlotbandEvents<Datum>, PlotbandSlots<Datum>> {
    get getComponent(): () => Plotband<Datum>;
}
export {};
