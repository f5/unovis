import { SvelteComponent } from "svelte";
import { XYContainerConfigInterface } from '@unovis/ts';
declare class __sveltets_Render<Datum> {
    props(): {
        /**
           * CSS class string. Requires `:global` modifier to take effect. _i.e._
           * ```css
           * div :global(.chart) { }
           * ```
           * @example
           * <div>
           *     <VisXYContainer class='chart'>
           *        ...
           *     <VisXYContainer>
           * </div>
           *
           * @see {@link https://svelte.dev/docs/svelte-components#styles}
          */ class?: string;
    } & XYContainerConfigInterface<Datum> & {
        data?: Datum[];
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {
        default: {};
    };
}
export type XyContainerProps<Datum> = ReturnType<__sveltets_Render<Datum>['props']>;
export type XyContainerEvents<Datum> = ReturnType<__sveltets_Render<Datum>['events']>;
export type XyContainerSlots<Datum> = ReturnType<__sveltets_Render<Datum>['slots']>;
export default class XyContainer<Datum> extends SvelteComponent<XyContainerProps<Datum>, XyContainerEvents<Datum>, XyContainerSlots<Datum>> {
}
export {};
