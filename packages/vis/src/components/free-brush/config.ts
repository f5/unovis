import { D3BrushEvent } from 'd3-brush'
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { FreeBrushMode, FreeBrushSelection } from './types'

// We extend partial XY config interface because x and y properties are optional for FreeBrush
export interface FreeBrushConfigInterface<Datum> extends Partial<XYComponentConfigInterface<Datum>> {
  /** Brush selection mode. X - horizontal, Y - vertical, XY - both. Default: `FreeBrushMode.X` */
  mode?: FreeBrushMode;
  /** Callback function to be called on any Brush event.
   * Default: `(selection: FreeBrushSelection, event: D3BrushEvent<Datum>, userDriven: boolean): void => {}`
  */
  onBrush?: ((selection?: FreeBrushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => void);
  /** Callback function to be called on the Brush start event.
   * Default: `(selection: FreeBrushSelection, event: D3BrushEvent<Datum>, userDriven: boolean): void => {}`
  */
  onBrushStart?: ((selection?: FreeBrushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => void);
  /** Callback function to be called on the Brush move event.
   * Default: `(selection: FreeBrushSelection, event: D3BrushEvent<Datum>, userDriven: boolean): void => {}`
  */
  onBrushMove?: ((selection?: FreeBrushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => void);
  /** Callback function to be called on the Brush end event.
   * Default: `(selection: FreeBrushSelection, event: D3BrushEvent<Datum>, userDriven: boolean)L void => {}`
  */
  onBrushEnd?: ((selection?: FreeBrushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => void);
  /** Width of the Brush handle. Default: `1` */
  handleWidth?: number;
  /** Brush selection in data space, can be used to force set the selection from outside.
   * In case of two dimensional mode, the selection has the following format: `[[xMin, xMax], [yMin, yMax]]`.
   * This config property gets updated on internal brush events. Default: `undefined`
  */
  selection?: FreeBrushSelection | null;
  /** Constraint Brush selection to a minimal length in data units. Default: `undefined` */
  selectionMinLength?: number | [number, number];
  /** Automatically hide the brush after selection. Default: `true` */
  autoHide?: boolean;
}

export class FreeBrushConfig<Datum> extends XYComponentConfig<Datum> implements FreeBrushConfigInterface<Datum> {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
  onBrush = (s: FreeBrushSelection, e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
  onBrushStart = (s: FreeBrushSelection, e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
  onBrushMove = (s: FreeBrushSelection, e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
  onBrushEnd = (s: FreeBrushSelection, e: D3BrushEvent<Datum>, userDriven: boolean): void => {}
  handleWidth = 1
  selection: FreeBrushSelection = undefined
  selectionMinLength = undefined
  mode: FreeBrushMode = FreeBrushMode.X
  autoHide = true
}
