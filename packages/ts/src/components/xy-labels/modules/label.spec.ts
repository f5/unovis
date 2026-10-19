import { describe, expect, it, vi } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { select } from 'd3-selection'

import { XYLabelsDefaultConfig } from '../config'
import { XYLabel } from '../types'
import { createLabels, getLabelRenderProps, updateLabels } from './label'

describe('XYLabels colors', () => {
  it.each([undefined, 'series'])('keeps text automatic with palette background key %s', (key) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const data = { x: 1, y: 2 }
    const config = { ...XYLabelsDefaultConfig, x: 1, y: 2, labelFontSize: 12, colorKeys: [key] }
    const scale = scaleLinear()
    const colorFunction = vi.fn(() => '#ffffff')
    const props = getLabelRenderProps(data, el, config, scale, scale, 0, colorFunction)

    expect(props.labelColor).toBeNull()
    expect(props.backgroundColor).toBe('#ffffff')
    expect(colorFunction).toHaveBeenCalledExactlyOnceWith(key ?? 0)
  })

  it.each([
    ['rgb(255, 255, 255)', 'var(--vis-xy-label-text-color-dark)'],
    ['rgb(0, 0, 0)', 'var(--vis-xy-label-text-color-light)'],
  ])('renders contrasting text on %s', (backgroundColor, textColor) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const data = { x: 1, y: 2 }
    const config = { ...XYLabelsDefaultConfig, x: 1, y: 2, label: 'Label', labelFontSize: 12 }
    const scale = scaleLinear()
    const props = getLabelRenderProps(data, el, config, scale, scale, 0, () => backgroundColor)
    const selection = select(el).datum({ ...data, _screen: props })

    selection.call(createLabels).call(updateLabels, config, 0)

    expect(selection.select('text').text()).toBe('Label')
    expect(selection.select('text').style('fill')).toBe(textColor)
    expect(selection.select('rect').style('fill')).toBe(backgroundColor)
  })

  it('preserves explicit text colors and accessor arguments', () => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const data = { x: 1, y: 2, color: '#123456' }
    const config = { ...XYLabelsDefaultConfig, x: 1, y: 2, labelFontSize: 12, colorKeys: ['first', 'second'] }
    const scale = scaleLinear()
    const colorAccessor = vi.fn(() => '#654321')

    expect(getLabelRenderProps(data, el, config, scale, scale, 1).labelColor).toBe(data.color)
    expect(getLabelRenderProps(data, el, { ...config, color: '#abcdef' }, scale, scale, 1).labelColor).toBe('#abcdef')
    expect(getLabelRenderProps(data, el, { ...config, color: ['#ffffff', '#000000'] }, scale, scale, 1).labelColor).toBe('#000000')
    expect(getLabelRenderProps(data, el, { ...config, color: colorAccessor }, scale, scale, 1).labelColor).toBe('#654321')
    expect(colorAccessor).toHaveBeenCalledExactlyOnceWith(data, 1, 'second')
  })

  it.each([null, undefined])('keeps text automatic when an accessor returns %s', (value) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const config = { ...XYLabelsDefaultConfig, x: 1, y: 2, labelFontSize: 12, colorKeys: ['series'], color: () => value }
    const scale = scaleLinear()

    expect(getLabelRenderProps({}, el, config, scale, scale, 0).labelColor).toBeNull()
  })

  it('preserves cluster colors without falling back to the palette', () => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const config = { ...XYLabelsDefaultConfig, x: 1, y: 2, labelFontSize: 12, clusterFontSize: 14 }
    const scale = scaleLinear()
    const records: XYLabel<unknown>[] = [{ _screen: getLabelRenderProps({}, el, config, scale, scale, 0) }]
    const colorFunction = vi.fn(() => '#abcdef')
    const props = getLabelRenderProps(records, el, config, scale, scale, undefined, colorFunction)

    expect(props.labelColor).toBeNull()
    expect(props.backgroundColor).toBeNull()
    expect(props.labelText).toBe('1')
    expect(colorFunction).not.toHaveBeenCalled()

    const clusterConfig = { ...config, clusterLabelColor: () => '#123456', clusterBackgroundColor: () => '#654321' }
    const explicitProps = getLabelRenderProps(records, el, clusterConfig, scale, scale, undefined, colorFunction)

    expect(explicitProps.labelColor).toBe('#123456')
    expect(explicitProps.backgroundColor).toBe('#654321')
  })
})
