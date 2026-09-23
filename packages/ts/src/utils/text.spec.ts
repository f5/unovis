import { describe, expect, it } from 'vitest'

// Types
import { TrimMode, UnovisText } from '@/types/text'

// Utils
import { getWrappedText } from '@/utils/text'

// The fast estimate makes the wrapping independent of the environment: 6px per character
const text: UnovisText = { text: 'alpha beta gamma delta epsilon zeta', fontSize: 10, fontWidthToHeightRatio: 0.6 }
const lines = (maxLines?: number, trimMode?: TrimMode): string[] =>
  getWrappedText(text, 70, undefined, true, undefined, false, maxLines, trimMode).flatMap(block => block._lines)

describe('getWrappedText (jsdom)', () => {
  it('wraps into as many lines as the width takes', () => {
    expect(lines()).toEqual(['alpha beta', 'gamma', 'delta', 'epsilon', 'zeta'])
  })

  it('trims the text to fit `maxLines`, from the end by default', () => {
    expect(lines(2)).toEqual(['alpha beta', 'gamma delt…'])
    expect(lines(1)).toEqual(['alpha beta…'])
  })

  it('trims from the start', () => {
    expect(lines(2, TrimMode.Start)).toEqual(['…a epsilon', 'zeta'])
  })

  it('trims from the middle', () => {
    expect(lines(2, TrimMode.Middle)).toEqual(['alpha', 'be…lon zeta'])
  })

  it('leaves text within `maxLines` alone', () => {
    expect(lines(5)).toEqual(lines())
  })

  describe('words wider than the line', () => {
    const width = 70
    const wrap = (value: string, maxLines: number, trimMode: TrimMode, fastMode = true): string[] =>
      getWrappedText({ ...text, text: value }, width, undefined, fastMode, [' ', '_'], false, maxLines, trimMode).flatMap(block => block._lines)

    // A line's width in the fast estimate, which the precise measurement below is shimmed to match
    const widthOf = (line: string): number => line.length * 6
    const expectToFit = (result: string[], maxLines: number): void => {
      expect(result.length).toBeLessThanOrEqual(maxLines)
      result.forEach(line => expect(widthOf(line)).toBeLessThanOrEqual(width))
      expect(result.join(' ')).toContain('…')
    }

    const tailWord = 'FA_06 (TX FAIL WET2_ALIGNMENTOVERFLOW)'
    const headWord = 'FAA_41 (TX_INSUFFICIENTLYLONGWORD EPOXY 3410)'
    it.each(Object.values(TrimMode))('keeps every line within the width when trimming from the %s', trimMode => {
      expectToFit(wrap(tailWord, 2, trimMode), 2)
      expectToFit(wrap(headWord, 2, trimMode), 2)
    })

    it('keeps the start and the end around a middle ellipsis', () => {
      const result = wrap(tailWord, 2, TrimMode.Middle).join(' ')
      expect(result.startsWith('FA')).toBe(true)
      expect(result.endsWith(')')).toBe(true)
    })

    it('trims a single overflowing word even when it fits `maxLines`', () => {
      expectToFit(wrap('SUPERCALIFRAGILISTICEXPIALIDOCIOUS', 2, TrimMode.End), 2)
      // Without `maxLines` the word still overflows, as before
      expect(getWrappedText({ ...text, text: 'SUPERCALIFRAGILISTICEXPIALIDOCIOUS' }, width).flatMap(block => block._lines))
        .toEqual(['SUPERCALIFRAGILISTICEXPIALIDOCIOUS'])
    })

    it('never trims down to a bare ellipsis', () => {
      const narrow = (trimMode: TrimMode): string[] =>
        getWrappedText({ ...text, text: tailWord }, 1, undefined, true, undefined, false, 1, trimMode).flatMap(block => block._lines)
      expect(narrow(TrimMode.End)).toEqual(['F…'])
      expect(narrow(TrimMode.Start)).toEqual(['…)'])
      expect(narrow(TrimMode.Middle)).toEqual(['F…)'])
    })

    it('measures precisely the same way it breaks the lines', () => {
      // jsdom has no canvas, so the precise measurement goes through `getComputedTextLength`
      Object.defineProperty(SVGElement.prototype, 'getComputedTextLength', {
        configurable: true,
        value (this: SVGElement): number { return widthOf(this.textContent ?? '') },
      })
      expectToFit(wrap(tailWord, 2, TrimMode.Middle, false), 2)
    })
  })
})
