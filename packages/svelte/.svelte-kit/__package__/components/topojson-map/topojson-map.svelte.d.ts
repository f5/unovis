import { SvelteComponent } from "svelte";
import { TopoJSONMap } from '@unovis/ts';
declare class __sveltets_Render<AreaDatum, PointDatum, LinkDatum> {
    props(): {
        [x: string]: any;
        data?: {
            areas?: AreaDatum[];
            points?: PointDatum[];
            links?: LinkDatum[];
        };
        getComponent?: () => TopoJSONMap<AreaDatum, PointDatum, LinkDatum>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type TopojsonMapProps<AreaDatum, PointDatum, LinkDatum> = ReturnType<__sveltets_Render<AreaDatum, PointDatum, LinkDatum>['props']>;
export type TopojsonMapEvents<AreaDatum, PointDatum, LinkDatum> = ReturnType<__sveltets_Render<AreaDatum, PointDatum, LinkDatum>['events']>;
export type TopojsonMapSlots<AreaDatum, PointDatum, LinkDatum> = ReturnType<__sveltets_Render<AreaDatum, PointDatum, LinkDatum>['slots']>;
export default class TopojsonMap<AreaDatum, PointDatum, LinkDatum> extends SvelteComponent<TopojsonMapProps<AreaDatum, PointDatum, LinkDatum>, TopojsonMapEvents<AreaDatum, PointDatum, LinkDatum>, TopojsonMapSlots<AreaDatum, PointDatum, LinkDatum>> {
    get getComponent(): () => TopoJSONMap<AreaDatum, PointDatum, LinkDatum>;
}
export {};
