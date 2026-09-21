import { beforeAll, describe, expect, it } from 'vitest'

// Types
import { Rect } from '@/types/misc'
import { ScaleDimension } from '@/types/scale'
import { TextAlign, TrimMode } from '@/types/text'

// Local
import { Axis } from './index'
import { AxisConfigInterface } from './config'
import { AxisType, TickSets, TickValues } from './types'
import { getRotatedTickTextMaxWidth, mergeTickValues, tickKey } from './tick-fit'
import * as s from './style'

const FONT_SIZE = 12
const LINE_HEIGHT_PX = FONT_SIZE * 1.25
/** Roughly the width of a character of uppercase-heavy text, relative to the font size */
const CHAR_WIDTH_RATIO = 0.6

// The labels of the reported chart: 10 category ticks in a 728px wide container
const failureModes = [
  'FA_06 (TX FAIL WET2_ALIGNMENT)',
  'FAA_11 (RX RESPONSIVITY LOW)',
  'FAA_26 (TX_FAU CHIP)',
  'FAA_33 (LENS CONTAMINATION)',
  'FAA_41 (TX_INSUFFICIENT EPOXY 3410)',
  'FAA_19 (SUBMOUNT SOLDER VOID)',
  'FAA_25 (WIRE BOND DAMAGE)',
  'FAA_07 (TEC OPEN CIRCUIT)',
  'FAA_28 (FIBER CABLE DAMAGE)',
  'FAA_52 (PD DARK CURRENT HIGH)',
]

/** The private members of `Axis` the spec drives directly, to stay clear of the layout-dependent
 * parts of the render (jsdom doesn't lay out) */
type AxisInternals = {
  _tickTextStyleCached: { fontSize: number; fontFamily: string };
  _getFittingTickValues: () => TickSets | undefined;
  _renderAxis: (selection: undefined, duration: number, tickValues?: TickValues, labeledTickKeys?: Set<string>) => void;
  _alignTickLabels: () => void;
  _getTickTextMaxWidth: (labelCount: number) => number;
  _getTickLabelRects: (values: TickValues) => Rect[];
}

const internals = (axis: Axis<unknown>): AxisInternals => axis as unknown as AxisInternals

type AxisSize = { width: number; height: number; containerWidth: number; containerHeight: number }

type RenderedLabel = {
  tickX: number;
  /** Centre of the whole label block along the axis */
  centerX: number;
  /** Centre of the block in the labels' own (rotated) frame, the frame `_getTickLabelRects` predicts in */
  frameCenter: [number, number];
  /** `y` of the first line, in the label's own frame */
  firstLineY: number;
  lineCount: number;
  hidden: boolean;
}

function createAxis (config: AxisConfigInterface<unknown>, size: AxisSize, domain: [number, number]): Axis<unknown> {
  const axis = new Axis<unknown>({ type: AxisType.X, ...config })
  axis.setSize(size.width, size.height, size.containerWidth, size.containerHeight)
  axis.setScaleDomain(ScaleDimension.X, domain)
  axis.setScaleRange(ScaleDimension.X, [0, size.width])
  // Resolving the style needs layout
  internals(axis)._tickTextStyleCached = { fontSize: FONT_SIZE, fontFamily: 'sans-serif' }
  return axis
}

/** The tick label part of `Axis._render`, without the parts that need layout (axis label, grid, overlap pass) */
function renderTickLabels (axis: Axis<unknown>): void {
  const tickSets = internals(axis)._getFittingTickValues()
  const renderTickValues = tickSets && mergeTickValues(tickSets.originalTicks, tickSets.fittedTicks)
  const labeledTickKeys = tickSets && new Set(tickSets.labeledTicks.map(tickKey))
  internals(axis)._renderAxis(undefined, 0, renderTickValues, labeledTickKeys)
  if (axis.config.tickTextAlign) internals(axis)._alignTickLabels()
}

/** Reads the label geometry off the rendered attributes — the tick's translation, the label's
 * rotation and its lines' positions — the way a browser would lay it out */
function readLabels (axis: Axis<unknown>): RenderedLabel[] {
  return Array.from(axis.element.querySelectorAll<SVGGElement>('g.tick')).map(tick => {
    const tickX = Number.parseFloat(/translate\(([^,]+),/.exec(tick.getAttribute('transform'))[1])
    const text = tick.querySelector('text')
    const angle = Number.parseFloat(/rotate\(([^ )]+)/.exec(text.getAttribute('transform') ?? '')?.[1] ?? '0')
    const lines = Array.from(text.querySelectorAll('tspan tspan'))
    const anchorX = Number.parseFloat(lines[0].getAttribute('x'))
    const firstLineY = Number.parseFloat(text.querySelector('tspan').getAttribute('y') ?? '0')

    // The lines start, end or are centred at the anchor depending on the alignment (measured like
    // the shim below does); the first line is centred on the anchor and the following ones are
    // stacked a line height apart
    const blockWidth = Math.max(...lines.map(line => line.textContent.length * FONT_SIZE * CHAR_WIDTH_RATIO))
    const textAnchor = text.getAttribute('text-anchor')
    const blockCenterX = anchorX + (textAnchor === 'end' ? -blockWidth / 2 : textAnchor === 'start' ? blockWidth / 2 : 0)
    const blockCenterY = firstLineY + (lines.length - 1) * LINE_HEIGHT_PX / 2
    const angleRad = angle / 180 * Math.PI
    const centerX = tickX + blockCenterX * Math.cos(angleRad) - blockCenterY * Math.sin(angleRad)
    const frameCenter: [number, number] = [blockCenterX + tickX * Math.cos(angleRad), blockCenterY - tickX * Math.sin(angleRad)]
    return { tickX, centerX, frameCenter, firstLineY, lineCount: lines.length, hidden: text.classList.contains(s.tickTextHidden) }
  })
}

// jsdom doesn't lay out SVG text and has no canvas, so `getPreciseStringLengthPx` measures through this
beforeAll(() => {
  Object.defineProperty(SVGElement.prototype, 'getComputedTextLength', {
    configurable: true,
    value (this: SVGElement): number {
      const fontSize = Number.parseFloat(this.getAttribute('font-size')) || FONT_SIZE
      return (this.textContent?.length ?? 0) * fontSize * CHAR_WIDTH_RATIO
    },
  })
})

describe('Axis tick labels (jsdom)', () => {
  const createFailureModeAxis = (containerWidth: number, tickTextAngle: number): Axis<unknown> => createAxis({
    tickValues: failureModes.map((_, i) => i),
    tickFormat: tick => failureModes[tick as number],
    tickTextAngle,
    tickTextAlign: TextAlign.Right,
    tickTextHideOverlapping: true,
    tickTextAdaptiveSets: true,
  }, { width: containerWidth - 58, height: 300, containerWidth, containerHeight: 360 }, [-0.5, failureModes.length - 0.5])

  it('labels all 10 rotated ticks of the reported chart, on both sides of the former 800px cliff', () => {
    for (const containerWidth of [728, 800, 840]) {
      const axis = createFailureModeAxis(containerWidth, -90)
      renderTickLabels(axis)
      const labels = readLabels(axis)

      expect(labels).toHaveLength(10)
      expect(labels.filter(label => label.hidden)).toHaveLength(0)
      expect(labels.some(label => label.lineCount > 1)).toBe(true)
      labels.forEach(label => expect(Math.abs(label.centerX - label.tickX)).toBeLessThan(1))
    }
  })

  it('labels all 10 ticks at -75°, where the labels run parallel and clear of each other', () => {
    const axis = createFailureModeAxis(728, -75)
    renderTickLabels(axis)
    const labels = readLabels(axis)

    expect(labels.filter(label => label.hidden)).toHaveLength(0)
    expect(labels.some(label => label.lineCount > 1)).toBe(true)
  })

  it('thins the labels by the configured overlap tolerance', () => {
    // At -60° the 2-line neighbours end up 28px apart across their lines
    const axis = createFailureModeAxis(728, -60)
    renderTickLabels(axis)
    expect(readLabels(axis).filter(label => !label.hidden)).toHaveLength(10)

    axis.setConfig({ ...axis.config, tickTextOverlapTolerance: 30 })
    renderTickLabels(axis)
    expect(readLabels(axis).filter(label => !label.hidden)).toHaveLength(5)
  })

  it('keeps trimmed labels within the rotated labels\' depth bound on a short chart', () => {
    const axis = createAxis({
      tickValues: failureModes.map((_, i) => i),
      tickFormat: tick => failureModes[tick as number],
      tickTextAngle: -90,
      tickTextAlign: TextAlign.Right,
      tickTextMaxLines: 2,
      tickTextTrimType: TrimMode.Middle,
      tickTextSeparator: [' ', '-', '.', ',', '_'],
    }, { width: 670, height: 160, containerWidth: 728, containerHeight: 220 }, [-0.5, failureModes.length - 0.5])
    renderTickLabels(axis)

    const budget = internals(axis)._getTickTextMaxWidth(failureModes.length)
    expect(budget).toBeCloseTo(220 / 3)
    const lines = Array.from(axis.element.querySelectorAll('g.tick > text tspan tspan')).map(line => line.textContent)
    lines.forEach(line => expect(line.length * FONT_SIZE * CHAR_WIDTH_RATIO).toBeLessThanOrEqual(budget))

    // The predicted rects are as deep as the render: at most the budget along the rotated text
    internals(axis)._getTickLabelRects(failureModes.map((_, i) => i))
      .forEach(rect => expect(rect.width).toBeLessThanOrEqual(budget))
  })

  it('caps wrapped labels at `tickTextMaxLines`, trimming the rest', () => {
    const axis = createFailureModeAxis(728, -90)
    axis.setConfig({ ...axis.config, tickTextMaxLines: 2 })
    renderTickLabels(axis)
    const labels = readLabels(axis)

    expect(Math.max(...labels.map(label => label.lineCount))).toBe(2)
    expect(labels.filter(label => label.hidden)).toHaveLength(0)
    const texts = Array.from(axis.element.querySelectorAll('g.tick > text')).map(text => text.textContent)
    expect(texts.some(text => text.includes('…'))).toBe(true)
  })

  it('still thins the labels when they cannot fit', () => {
    const axis = createFailureModeAxis(400, -90)
    renderTickLabels(axis)
    const shown = readLabels(axis).filter(label => !label.hidden)

    expect(shown.length).toBeGreaterThan(0)
    expect(shown.length).toBeLessThan(10)
  })

  it('bounds rotated labels by the margin depth once a line clears the slot, by the slot otherwise', () => {
    const vertical = -Math.PI / 2
    expect(getRotatedTickTextMaxWidth(66, vertical, 15, 120, 0)).toBeCloseTo(120)
    // At 30° a 20px slot doesn't clear a 15px line across, so the text is bounded along the axis
    const shallow = -Math.PI / 6
    expect(getRotatedTickTextMaxWidth(20, shallow, 15, 120, 0)).toBeCloseTo((20 - 15 * 0.5) / Math.cos(shallow))
    // The overlap tolerance adds to the room a line needs across
    const steep = -Math.PI / 3
    expect(getRotatedTickTextMaxWidth(20, steep, 15, 120, 0)).toBeCloseTo(120 / Math.sin(-steep))
    expect(getRotatedTickTextMaxWidth(20, steep, 15, 120, 10)).toBeCloseTo(Math.max(0, (20 - 15 * Math.sin(-steep)) / Math.cos(steep)))
  })

  it('does not shrink the wrap width of rotated labels with the label count', () => {
    const rotated = internals(createFailureModeAxis(728, -90))
    expect(rotated._getTickTextMaxWidth(10)).toBe(rotated._getTickTextMaxWidth(5))
    expect(rotated._getTickTextMaxWidth(10)).toBeCloseTo(360 / 3)

    const horizontal = internals(createFailureModeAxis(728, 0))
    expect(horizontal._getTickTextMaxWidth(10)).toBeCloseTo(728 / 11)
    expect(horizontal._getTickTextMaxWidth(5)).toBeCloseTo(728 / 6)
  })

  describe('wrapped label block placement', () => {
    // Labels wrapping into 1, 2, 3 and 4 lines at the fixed width
    const labels = ['AB', 'AB CD', 'AB CD EF', 'AB CD EF GH']
    const createLabelAxis = (tickTextAngle: number, tickTextAlign: TextAlign): Axis<unknown> => createAxis({
      tickValues: labels.map((_, i) => i),
      tickFormat: tick => labels[tick as number],
      tickTextAngle: tickTextAngle || undefined,
      tickTextAlign,
      tickTextWidth: 30,
    }, { width: 400, height: 300, containerWidth: 450, containerHeight: 360 }, [-0.5, labels.length - 0.5])

    const cases: [number, TextAlign][] = [[-90, TextAlign.Right], [-45, TextAlign.Right], [0, TextAlign.Center]]
    it.each(cases)('centres the block on the tick at %d°, whatever the line count', (tickTextAngle, tickTextAlign) => {
      const axis = createLabelAxis(tickTextAngle, tickTextAlign)
      renderTickLabels(axis)
      const rendered = readLabels(axis)
      expect(rendered.map(label => label.lineCount)).toEqual([1, 2, 3, 4])

      // Right-aligned diagonal labels end at the anchor, so their centre is off the tick by a constant
      const offsets = rendered.map(label => label.centerX - label.tickX)
      const expectedOffset = tickTextAngle === -45 ? offsets[0] : 0
      offsets.forEach(offset => expect(Math.abs(offset - expectedOffset)).toBeLessThan(1))

      // The rects the tick fitting decides on match the render
      const rects = internals(axis)._getTickLabelRects(labels.map((_, i) => i))
      rects.forEach((rect, i) => {
        const [x, y] = rendered[i].frameCenter
        expect(Math.hypot(rect.x + rect.width / 2 - x, rect.y + rect.height / 2 - y)).toBeLessThan(1)
      })
    })

    it('keeps anchoring horizontal labels by their first line', () => {
      const axis = createLabelAxis(0, TextAlign.Center)
      renderTickLabels(axis)
      const { tickSize, tickPadding } = axis.config
      readLabels(axis).forEach(label => {
        expect(label.firstLineY).toBeCloseTo((tickSize as number) + tickPadding + FONT_SIZE / 2)
      })
    })
  })
})
