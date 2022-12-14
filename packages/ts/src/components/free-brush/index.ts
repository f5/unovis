import { Selection } from 'd3-selection'
import { brush, BrushBehavior, brushX, brushY, D3BrushEvent } from 'd3-brush'
import { XYComponentCore } from 'core/xy-component'
import { clamp, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Types
import { ContinuousScale } from 'types/scale'
import { FreeBrushMode, FreeBrushSelection, FreeBrushSelectionInPixels } from './types'

// Config
import { FreeBrushConfig, FreeBrushConfigInterface } from './config'

// Styles
import * as s from './style'

export class FreeBrush<Datum> extends XYComponentCore<Datum, FreeBrushConfig<Datum>, FreeBrushConfigInterface<Datum>> {
  static selectors = s
  config: FreeBrushConfig<Datum> = new FreeBrushConfig()
  private brush: Selection<SVGGElement, unknown, SVGGElement, unknown>
  private brushBehaviour: BrushBehavior<unknown>
  private _firstRender = true

  constructor (config: FreeBrushConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)

    this.brush = this.g
      .append('g')
      .attr('class', s.brush)
  }

  _render (customDuration?: number): void {
    const { config } = this
    const xScale = this.xScale
    const yScale = this.yScale
    const duration = isNumber(customDuration) ? customDuration : config.duration

    if (this._firstRender) this.brush.classed(s.hide, this._firstRender && config.autoHide)

    // Sometimes Brush stops emitting 'start' and 'end' events. Possible explanation:
    // "... mouseup will only fire when performed within the browser, which can lead to losing track of the button state."
    // https://stackoverflow.com/a/48970682
    //
    // D3 code related to the problem:
    // https://github.com/d3/d3-brush/blob/ec2bce6f15074a9ead7f9a84c61335be51c123a3/src/brush.js#L301
    //
    // We're clearing brush's event emitter state to force it to get re-initialized
    // Caveat of this solution: If you're doing a brush selection and a render happens
    // (e.g. due to a data or config update), it'll reset the brush.
    //
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.brush.node().__brush) this.brush.node().__brush.emitter = undefined

    this.brushBehaviour = this._getBrushBehaviour(config.mode)

    this.brushBehaviour
      .handleSize(config.handleWidth)
      .extent([[0, 0], [this._width, this._height]])
      .on('start', this._onBrushStart.bind(this))
      .on('brush', this._onBrushMove.bind(this))
      .on('end', this._onBrushEnd.bind(this))

    this.brush
      .call(this.brushBehaviour)

    // Calculate the brush range from configured selection and apply it
    let brushRange: FreeBrushSelectionInPixels
    switch (config.mode) {
      case FreeBrushMode.XY: {
        const xSelectionRange = this._dataRangeToPixelRange([config.selection?.[0][0], config.selection?.[0][1]], xScale)
        const ySelectionRange = this._dataRangeToPixelRange([config.selection?.[1][0], config.selection?.[1][1]], yScale, true)
        brushRange = (xSelectionRange && ySelectionRange) ? [[xSelectionRange[0], ySelectionRange[0]], [xSelectionRange[1], ySelectionRange[1]]] : null
        break
      }
      case FreeBrushMode.X:
      case FreeBrushMode.Y:
      default: {
        const scale = config.mode === FreeBrushMode.Y ? yScale : xScale
        brushRange = this._dataRangeToPixelRange(config.selection as [number, number], scale, config.mode === FreeBrushMode.Y)
      }
    }

    smartTransition(this.brush, duration)
      .call(this.brushBehaviour.move, brushRange) // Sets up the brush and calls brush events
      .on('end interrupt', () => { this._firstRender = false })

    if (!duration) this._firstRender = false
  }

  private _onBrush (event: D3BrushEvent<Datum>): void {
    const { config } = this
    const userDriven = !!event?.sourceEvent

    // Selection from the brush events is in Screen Space (pixels)
    // In case of two dimensional brush is comes as [ [xMinPx, yMinPx], [xMaxPx, yMaxPx] ],
    //   while in the config we'll be storing it as [ [xMin, xMax], [yMin, yMax] ]
    const s = (event?.selection) as FreeBrushSelectionInPixels
    if (!this._isSelectionValid(s)) {
      config.selection = null
      return
    }

    // Convert the raw brush selection from pixels to data units, store it in the config and trigger the onBrush callback
    let selectedDomain: FreeBrushSelection
    switch (config.mode) {
      case FreeBrushMode.XY: {
        const xSelection = this._pixelRangeToDataRange([s[0][0], s[1][0]], this.xScale, config.selectionMinLength?.[0] ?? config.selectionMinLength)
        const ySelection = this._pixelRangeToDataRange([s[0][1], s[1][1]], this.yScale, config.selectionMinLength?.[1] ?? config.selectionMinLength, true)
        selectedDomain = (xSelection && ySelection) ? [
          [xSelection?.[0], xSelection?.[1]],
          [ySelection?.[0], ySelection?.[1]],
        ] : null
        break
      }
      case FreeBrushMode.Y: {
        selectedDomain = this._pixelRangeToDataRange(s as [number, number], this.yScale, config.selectionMinLength, true)
        break
      }
      case FreeBrushMode.X:
      default: {
        selectedDomain = this._pixelRangeToDataRange(s as [number, number], this.xScale, config.selectionMinLength)
        break
      }
    }

    if (selectedDomain === null || selectedDomain[0] === null || selectedDomain[1] === null) {
      this.brush.call(this.brushBehaviour.move, null)
      return
    }

    config.selection = selectedDomain
    if (!this._firstRender) config.onBrush(selectedDomain, event, userDriven)
  }

  private _pixelRangeToDataRange (selectionInPixels: [number, number], scale: ContinuousScale, constraint: number, reversed?: boolean): [number, number] | null {
    const selectedDomain = selectionInPixels.map(n => scale.invert(n)) as [number, number]
    if (reversed) selectedDomain.reverse()

    const domain = scale.domain() as [number, number]
    const domainLength = Math.abs(domain[1] - domain[0])
    const selectionLength = Math.abs(selectedDomain[1] - selectedDomain[0])

    if (constraint >= domainLength) {
      console.warn('Unovis | FreeBrush: Configured domain constraint is bigger than the brush domain')
    }

    if ((selectionLength < constraint) && (constraint < domainLength)) return null
    else return selectedDomain
  }

  private _dataRangeToPixelRange (selectionInDataUnits: [number, number], scale: ContinuousScale, reversed?: boolean): [number, number] | null {
    if (!selectionInDataUnits) return null

    const range = scale.range()
    const s = [...selectionInDataUnits]
    if (reversed) {
      range.reverse()
      s.reverse()
    }
    const selectionMin = clamp(scale(s[0]) ?? 0, range[0], range[1])
    const selectionMax = clamp(scale(s[1]) ?? 0, range[0], range[1])
    return (selectionMax - selectionMin) ? [selectionMin, selectionMax] : null
  }

  private _isSelectionValid (s: FreeBrushSelection | FreeBrushSelectionInPixels): boolean {
    const { config } = this

    if (config.mode === FreeBrushMode.XY) {
      return s && Array.isArray(s[0]) && Array.isArray(s[1])
    } else {
      return s && isNumber(s[0]) && isNumber(s[1])
    }
  }

  private _getBrushBehaviour (mode: FreeBrushMode): BrushBehavior<Datum> {
    switch (mode) {
      case FreeBrushMode.X: return brushX()
      case FreeBrushMode.Y: return brushY()
      default: return brush()
    }
  }

  private _onBrushStart (event: D3BrushEvent<Datum>): void {
    const { config } = this
    const userDriven = !!event?.sourceEvent
    this._onBrush(event)
    if (config.autoHide && userDriven) this.brush.classed(s.hide, false)
    if (!this._firstRender) config.onBrushStart?.(config.selection, event, userDriven)
  }

  private _onBrushMove (event: D3BrushEvent<Datum>): void {
    const { config } = this

    this._onBrush(event)
    if (!this._firstRender) config.onBrushMove?.(config.selection, event, !!event?.sourceEvent)
  }

  private _onBrushEnd (event: D3BrushEvent<Datum>): void {
    const { config } = this

    this._onBrush(event)
    if (config.autoHide) this.brush.classed(s.hide, true)
    if (!this._firstRender) config.onBrushEnd?.(config.selection, event, !!event?.sourceEvent)
  }
}
