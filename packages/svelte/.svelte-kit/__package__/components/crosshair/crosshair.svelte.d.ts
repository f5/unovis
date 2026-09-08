import { SvelteComponent } from "svelte";
import { Crosshair, NumericAccessor } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        [x: string]: any;
        data?: Datum[];
        x: NumericAccessor<Datum>;
        y: NumericAccessor<Datum> | NumericAccessor<Datum>[];
        getComponent?: () => Crosshair<Datum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type CrosshairProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type CrosshairEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type CrosshairSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class Crosshair<Datum> extends SvelteComponent<CrosshairProps<Datum>, CrosshairEvents<Datum>, CrosshairSlots<Datum>> {
    get getComponent(): () => Crosshair<Datum>;
}
export {};
