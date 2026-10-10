import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'

import { ChoroplethData, countries, usersDomain, formatUsers, formatTraffic } from './data'
import { BLUES } from './constants'

export default function VegaLiteChoroplethMap ({ data, isDark }: { data: ChoroplethData; isDark: boolean }): JSX.Element {
  const point = new Map(data.points.map(p => [p.id, p]))
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    // The layers share the projection, which fits their data to the view
    projection: { type: 'equalEarth' },
    // Tooltips take a d3-format string rather than a function, so the values are formatted before they get to the spec
    layer: [
      {
        data: { values: countries },
        transform: [
          { lookup: 'id', from: { data: { values: data.areas.map(a => ({ ...a, label: formatUsers(a.users) })) }, key: 'id', fields: ['users', 'label'] } },
          { calculate: 'datum.label || \'No data\'', as: 'label' },
        ],
        // Shapes have no outline by default, and the lightest countries would vanish on a white page
        mark: { type: 'geoshape', stroke: 'lightgray', strokeWidth: 0.5 },
        encoding: {
          color: {
            field: 'users',
            type: 'quantitative',
            scale: { type: 'quantize', domain: usersDomain, range: BLUES },
            // On the right, the legend would take a quarter of the card's width
            legend: { title: 'Monthly active users (M)', orient: 'top' },
          },
          tooltip: [{ field: 'properties.name', title: 'Country' }, { field: 'label', title: 'Users' }],
        },
      },
      {
        data: { values: data.links.map(l => ({ source: point.get(l.source), target: point.get(l.target), width: 1 + l.traffic / 100, traffic: formatTraffic(l.traffic) })) },
        // In the default black, or white with the dark theme, the links would vanish over the darkest or the lightest countries
        mark: { type: 'rule', color: 'gray' },
        encoding: {
          longitude: { field: 'source.longitude', type: 'quantitative' },
          latitude: { field: 'source.latitude', type: 'quantitative' },
          longitude2: { field: 'target.longitude' },
          latitude2: { field: 'target.latitude' },
          strokeWidth: { field: 'width', type: 'quantitative', scale: null },
          tooltip: [{ field: 'source.name', title: 'From' }, { field: 'target.name', title: 'To' }, { field: 'traffic', title: 'Traffic' }],
        },
      },
      {
        data: { values: data.points },
        encoding: {
          longitude: { field: 'longitude', type: 'quantitative' },
          latitude: { field: 'latitude', type: 'quantitative' },
        },
        layer: [
          { mark: 'circle', encoding: { tooltip: [{ field: 'name', title: 'Data center' }] } },
          { mark: { type: 'text', dy: 8, baseline: 'top' }, encoding: { text: { field: 'name' } } },
        ],
      },
    ],
    config: {
      // Vega-Lite leaves out the shapes without a user count, such as the four without a country code, unless the color
      // scale has an output for them
      scale: { invalid: { color: { value: 'lightgray' } } },
      // The dark theme colors the legend only: the labels would stay black
      ...(isDark && { text: { color: '#fff' } }),
    },
  }

  return (
    <VegaEmbed
      spec={spec}
      options={{ actions: false, theme: isDark ? 'dark' : undefined, tooltip: { theme: isDark ? 'dark' : 'light' } }}
      style={{ height: '100%' }}
    />
  )
}
