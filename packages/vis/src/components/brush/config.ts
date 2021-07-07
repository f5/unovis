// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { D3BrushEvent } from 'd3-brush'
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { Arrangement } from 'types/position'

export interface BrushConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Callback function to be called on any Brush event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}`
  */
  onBrush?: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => any);
  /** Callback function to be called on the Brush start event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}`
  */
  onBrushStart?: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => any);
  /** Callback function to be called on the Brush move event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}`
  */
  onBrushMove?: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => any);
  /** Callback function to be called on the Brush end event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}`
  */
  onBrushEnd?: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => any);
  /** Width of the Brush handle. Default: `1` */
  handleWidth?: number;
  /** Brush selection in data space, can be used to force set the selection from outside.
   * This config property gets updated on internal brush events. Default: `undefined`
  */
  selection?: [number, number] | null;
  /** Allow dragging the selected area as a whole in order to change the selected range. Default: `false` */
  draggable?: boolean;
  /** Position of the handle: 'Arrangement.INSIDE' or 'Arrangement.OUTSIDE'. Default: `Arrangement.INSIDE` */
  handlePosition?: Arrangement | string;
  /** Constraint Brush selection to a minimal length in data units. Default: `undefined` */
  selectionMinLength?: number;
}

export class BrushConfig<Datum> extends XYComponentConfig<Datum> implements BrushConfigInterface<Datum> {
  onBrush = (s: [number, number], e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  onBrushStart = (s: [number, number], e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  onBrushMove = (s: [number, number], e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  onBrushEnd = (s: [number, number], e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  handleWidth = 9
  selection = null
  draggable = false
  handlePosition: Arrangement | string = Arrangement.INSIDE
  selectionMinLength = undefined
}
