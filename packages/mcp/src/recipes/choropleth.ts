import { z } from 'zod'

import type { Recipe } from './types.js'
import type { LegendItemSpec } from '../render/spec.js'
import { commonInput, ChartInputError } from './shared.js'
import { choroplethMaps, resolveArea } from './choropleth-regions.js'
import type { ChoroplethMapKey } from './choropleth-regions.js'

const hexColor = (): z.ZodString => z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'hex color, e.g. #2260C4')

const hexToRgb = (hex: string): number[] => {
  let h = hex.slice(1)
  if (h.length < 6) h = h.split('').map(c => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

const mixHex = (from: string, to: string, t: number): string => {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  return `#${a.map((channel, c) => Math.round(channel + (b[c] - channel) * t).toString(16).padStart(2, '0')).join('')}`
}

export const choroplethInputShape = {
  map: z.enum(['world', 'usa', 'germany', 'uk', 'france', 'india', 'china']).default('world')
    .describe('Which map to draw. Area ids: world — ISO 3166-1 alpha-2 codes or country names; ' +
      'usa — state names, USPS abbreviations or FIPS codes; germany/france/india — ISO 3166-2 codes or names; ' +
      'uk — statistical regions by name; china — province names'),
  data: z.array(z.object({
    id: z.string().min(1).describe('Area code or name (see the map option for accepted formats)'),
    value: z.number().describe('Numeric value driving the area color'),
  })).min(1).describe('One entry per area, e.g. [{"id":"US","value":21},{"id":"Germany","value":46}]'),
  colorRange: z.array(hexColor()).length(2).optional()
    .describe('[lowColor, highColor] hex pair; area colors are interpolated between them. Defaults to a blue ramp'),
  valueLabel: z.string().default('').describe('Unit for legend labels, e.g. "%" or " GWh"'),
  ...commonInput,
}

export const choroplethRecipe: Recipe<typeof choroplethInputShape> = {
  name: 'generate_choropleth_map',
  title: 'Choropleth map',
  description: 'Generate a choropleth map: geographic areas (countries, states, regions) shaded by value. ' +
    'Supports the world map plus USA, Germany, UK, France, India and China. ' +
    'Example: map="world", data=[{"id":"US","value":21},{"id":"BR","value":85},{"id":"Germany","value":46}].',
  inputShape: choroplethInputShape,
  toSpec: (input) => {
    const mapKey = input.map as ChoroplethMapKey
    const mapDef = choroplethMaps[mapKey]

    const unresolved: string[] = []
    const resolved = input.data.map(d => {
      const area = resolveArea(mapKey, d.id)
      if (!area) unresolved.push(d.id)
      return { area, value: d.value }
    })
    if (unresolved.length) {
      throw new ChartInputError(
        `Unknown ${input.map} area${unresolved.length > 1 ? 's' : ''}: ${unresolved.map(id => `"${id}"`).join(', ')}. ` +
        `Expected ${mapDef.idFormat}.`)
    }

    const values = resolved.map(r => r.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const [low, high] = input.colorRange ?? ['#dbe9fd', '#2260c4']
    const spread = max - min || 1

    const areas = resolved.map(r => ({
      id: r.area!.id,
      name: r.area!.name,
      value: r.value,
      color: mixHex(low, high, (r.value - min) / spread),
    }))

    const legend: LegendItemSpec[] = [
      { name: `${min}${input.valueLabel}`, color: low },
      { name: `${max}${input.valueLabel}`, color: high },
    ]

    return {
      container: 'single',
      width: input.width,
      height: input.height,
      theme: input.theme,
      title: input.title,
      colors: input.colors,
      components: [{
        type: 'TopoJSONMap',
        config: {
          topojson: { $unovisMap: mapDef.marker },
          disableZoom: true,
          ...(mapDef.projection ? { projection: { $mapProjection: mapDef.projection } } : {}),
        },
      }],
      legend,
      data: { areas },
    }
  },
}
