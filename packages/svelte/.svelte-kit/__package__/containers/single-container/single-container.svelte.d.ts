import { SvelteComponent } from "svelte";
import { SingleContainerConfigInterface } from '@unovis/ts';
declare class __sveltets_Render<Data> {
    props(): {
        /**
           * CSS class string. Requires `:global` modifier to take effect. _i.e._
           * ```css
           * div :global(.chart) { }
           * ```
           * @example
           * <div>
           *     <VisSingleContainer class='chart'>
           *        ...
           *     </VisSingleContainer>
           * </div>
           *
           * @see {@link https://svelte.dev/docs/svelte-components#styles}
          */ class?: string;
    } & SingleContainerConfigInterface<Data> & {
        data?: Data;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {
        default: {};
    };
}
export type SingleContainerProps<Data> = ReturnType<__sveltets_Render<Data>['props']>;
export type SingleContainerEvents<Data> = ReturnType<__sveltets_Render<Data>['events']>;
export type SingleContainerSlots<Data> = ReturnType<__sveltets_Render<Data>['slots']>;
export default class SingleContainer<Data> extends SvelteComponent<SingleContainerProps<Data>, SingleContainerEvents<Data>, SingleContainerSlots<Data>> {
}
export {};
