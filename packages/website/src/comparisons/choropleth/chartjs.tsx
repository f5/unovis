import React from 'react'
import { Chart, PointElement, Tooltip } from 'chart.js'
import { ChoroplethController, BubbleMapController, GeoFeature, ColorScale, ProjectionScale, SizeScale } from 'chartjs-chart-geo'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Chart as ReactChart } from 'react-chartjs-2'
import { geoArea } from 'd3-geo'

import type { ChartProps } from '../types'
import { ChoroplethData, countries, formatUsers, getTraffic, trafficRadius } from './data'

Chart.register(ChoroplethController, BubbleMapController, GeoFeature, ColorScale, ProjectionScale, SizeScale, PointElement, Tooltip)
// For the "Country labels" preset: of two overlapping labels, `display: 'auto'` hides the one later in the data, so the
// countries go largest first
const countriesByArea = [...countries].sort((a, b) => geoArea(b) - geoArea(a))

// The geo plugin draws the countries and the data centers as two datasets, and has no links between points
export default function ChartJsChoroplethMap ({ data, isDark, preset }: ChartProps<ChoroplethData>): JSX.Element {
  const users = new Map(data.areas.map(a => [a.id, a.users]))
  // 3 pixels is the default radius of points
  const bubbleRadius = ({ dataIndex }: { dataIndex: number }): number => preset === 'traffic' ? trafficRadius(getTraffic(data.links, data.points[dataIndex].id)) : 3
  return (
    <ReactChart
      type="choropleth"
      // Registered for this chart only: with `Chart.register`, every Chart.js chart on the site would get data labels
      plugins={[ChartDataLabels]}
      data={{
        labels: countriesByArea.map(f => f.properties.name),
        datasets: [
          {
            label: 'Monthly active users',
            outline: countries,
            data: countriesByArea.map(f => ({ feature: f, value: users.get(`${f.id}`) })),
          },
          {
            type: 'bubbleMap',
            label: 'Data centers',
            outline: countries,
            data: data.points.map(p => ({ longitude: p.longitude, latitude: p.latitude, value: 1 })),
            // Points are a transparent gray by default, so they get the first color of the Chart.js default palette
            backgroundColor: '#36a2eb',
            // Chart.js draws the first dataset on top, so the countries would cover the bubbles
            order: -1,
            // A bubbleMap chart sizes its bubbles by value, but in a choropleth chart the bubbles take a radius of their own.
            // Animated, the bubbles wouldn't shrink back from the preset's radii, and with a plain number they'd keep them
            radius: bubbleRadius,
            hoverRadius: (context: { dataIndex: number }) => bubbleRadius(context) + 1,
            animation: false,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        showOutline: true,
        plugins: {
          legend: { display: false },
          // The plugin anchors a label at the element's `x` and `y`, which the geo plugin sets to the country's center
          datalabels: {
            display: ctx => preset === 'labels' && ctx.datasetIndex === 0 ? 'auto' : false,
            formatter: (_, ctx) => ctx.chart.data.labels[ctx.dataIndex],
            color: isDark ? '#ddd' : '#444',
            textStrokeColor: isDark ? '#222' : '#fff',
            textStrokeWidth: 2,
          },
          tooltip: {
            callbacks: {
              label: ctx => ctx.datasetIndex === 1
                ? `${data.points[ctx.dataIndex].name} data center`
                : `${ctx.chart.data.labels[ctx.dataIndex]}: ${formatUsers((ctx.raw as { value: number }).value)}`,
            },
          },
        },
        scales: {
          projection: { axis: 'x', projection: preset === 'mercator' ? 'mercator' : 'equalEarth' },
          color: { axis: 'x', ticks: { color: isDark ? '#aaa' : '#666' } },
          size: { axis: 'x', display: false },
        },
      }}
    />
  )
}
