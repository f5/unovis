// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { D3BrushEvent } from 'd3-brush'

import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { BrushInteractiveType } from 'types/brush-interactive'
type brushSelection = [number, number] | [[number, number], [number, number]];
export interface BrushInteractiveConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
    onBrush?: ((selection?: brushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => any);
    onBrushStart?: ((selection?: brushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => any);
    onBrushMove?: ((selection?: brushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => any);
    onBrushEnd?: ((selection?: brushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => any);
    selection?: brushSelection| null;
    /** Allow dragging the selected area in order to change the selected range */
    draggable?: boolean;
    /** Constraint selection by some minimum size */
    selectionMinLength?: number;

    type: BrushInteractiveType;
}

export class BrushInteractiveConfig<Datum> extends XYComponentConfig<Datum> implements BrushInteractiveConfigInterface<Datum> {
    onBrush = (s: brushSelection, e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
    onBrushStart = (s: brushSelection, e: D3BrushEvent<Datum>, userDriven: boolean): void => { }
    onBrushMove = (s: brushSelection, e: D3BrushEvent<Datum>, userDriven: boolean): void => { }
    onBrushEnd = (s: brushSelection, e: D3BrushEvent<Datum>, userDriven: boolean): void => { }
    selection?: brushSelection;
    draggable = true;
    selectionMinLength = undefined;
    type: BrushInteractiveType = BrushInteractiveType.XY;
}
