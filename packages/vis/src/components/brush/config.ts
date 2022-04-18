import { D3BrushEvent } from 'd3-brush'
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { Arrangement } from 'types/position'

// We extend partial XY config interface because x and y properties are optional for Brush
export interface BrushConfigInterface<Datum> extends Partial<XYComponentConfigInterface<Datum>> {
  /** Callback function to be called on any Brush event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}`
  */
  onBrush?: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => void);
  /** Callback function to be called on the Brush start event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}`
  */
  onBrushStart?: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => void);
  /** Callback function to be called on the Brush move event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}`
  */
  onBrushMove?: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => void);
  /** Callback function to be called on the Brush end event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}`
  */
  onBrushEnd?: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => void);
  /** Width of the Brush handle. Default: `1` */
  handleWidth?: number;
  /** Brush selection in the data space coordinates, can be used to control the selection. Default: `undefined` */
  selection?: [number, number] | null;
  /** Allow dragging the selected area as a whole in order to change the selected range. Default: `false` */
  draggable?: boolean;
  /** Position of the handle: `Arrangement.Inside` or `Arrangement.Outside`. Default: `Arrangement.Inside` */
  handlePosition?: Arrangement | string;
  /** Constraint Brush selection to a minimal length in data units. Default: `undefined` */
  selectionMinLength?: number;
}

export class BrushConfig<Datum> extends XYComponentConfig<Datum> implements BrushConfigInterface<Datum> {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
  onBrush = (s: [number, number], e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
  onBrushStart = (s: [number, number], e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
  onBrushMove = (s: [number, number], e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
  onBrushEnd = (s: [number, number], e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  handleWidth = 9
  selection = null
  draggable = false
  handlePosition: Arrangement | string = Arrangement.Inside
  selectionMinLength = undefined
}
