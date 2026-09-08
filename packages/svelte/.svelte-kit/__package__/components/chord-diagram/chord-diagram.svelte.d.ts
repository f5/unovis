import { SvelteComponent } from "svelte";
import { ChordDiagram, ChordInputNode, ChordInputLink } from '@unovis/ts';
declare class __sveltets_Render<N extends ChordInputNode, L extends ChordInputLink> {
    props(): {
        [x: string]: any;
        data?: {
            nodes: N[];
            links?: L[];
        };
        getComponent?: () => ChordDiagram<N, L>;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type ChordDiagramProps<N extends ChordInputNode, L extends ChordInputLink> = ReturnType<__sveltets_Render<N, L>['props']>;
export type ChordDiagramEvents<N extends ChordInputNode, L extends ChordInputLink> = ReturnType<__sveltets_Render<N, L>['events']>;
export type ChordDiagramSlots<N extends ChordInputNode, L extends ChordInputLink> = ReturnType<__sveltets_Render<N, L>['slots']>;
export default class ChordDiagram<N extends ChordInputNode, L extends ChordInputLink> extends SvelteComponent<ChordDiagramProps<N, L>, ChordDiagramEvents<N, L>, ChordDiagramSlots<N, L>> {
    get getComponent(): () => ChordDiagram<N, L>;
}
export {};
