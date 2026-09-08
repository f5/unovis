import { SvelteComponent } from "svelte";
import { Sankey, SankeyInputNode, SankeyInputLink } from '@unovis/ts';
declare class __sveltets_Render<N extends SankeyInputNode, L extends SankeyInputLink> {
    props(): {
        [x: string]: any;
        data?: {
            nodes: N[];
            links?: L[];
        };
        getComponent?: () => Sankey<N, L>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type SankeyProps<N extends SankeyInputNode, L extends SankeyInputLink> = ReturnType<__sveltets_Render<N, L>['props']>;
export type SankeyEvents<N extends SankeyInputNode, L extends SankeyInputLink> = ReturnType<__sveltets_Render<N, L>['events']>;
export type SankeySlots<N extends SankeyInputNode, L extends SankeyInputLink> = ReturnType<__sveltets_Render<N, L>['slots']>;
export default class Sankey<N extends SankeyInputNode, L extends SankeyInputLink> extends SvelteComponent<SankeyProps<N, L>, SankeyEvents<N, L>, SankeySlots<N, L>> {
    get getComponent(): () => Sankey<N, L>;
}
export {};
