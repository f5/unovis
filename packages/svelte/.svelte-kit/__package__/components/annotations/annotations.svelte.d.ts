import { SvelteComponent } from "svelte";
import { Annotations, AnnotationItem } from '@unovis/ts';
declare const __propDef: {
    props: {
        [x: string]: any;
        items: AnnotationItem[] | undefined;
        getComponent?: () => Annotations;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {};
    bindings?: string;
};
export type AnnotationsProps = typeof __propDef.props;
export type AnnotationsEvents = typeof __propDef.events;
export type AnnotationsSlots = typeof __propDef.slots;
export default class Annotations extends SvelteComponent<AnnotationsProps, AnnotationsEvents, AnnotationsSlots> {
    get getComponent(): () => Annotations;
}
export {};
