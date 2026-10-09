import React from 'react'
import { Chart, PointElement, Tooltip } from 'chart.js'
import { ChoroplethController, BubbleMapController, GeoFeature, ColorScale, ProjectionScale, SizeScale } from 'chartjs-chart-geo'
import { Chart as ReactChart } from 'react-chartjs-2'

import { ChoroplethData, countries, formatUsers } from './data'

Chart.register(ChoroplethController, BubbleMapController, GeoFeature, ColorScale, ProjectionScale, SizeScale, PointElement, Tooltip)

// The geo plugin draws the countries and the data centers as two datasets, and has no links between points
export default function ChartJsChoroplethMap ({ data, isDark }: { data: ChoroplethData; isDark: boolean }): JSX.Element {
  const users = new Map(data.areas.map(a => [a.id, a.users]))
  return (
    <ReactChart
      type="choropleth"
      data={{
        labels: countries.map(f => f.properties.name),
        datasets: [
          {
            label: 'Monthly active users',
            outline: countries,
            data: countries.map(f => ({ feature: f, value: users.get(`${f.id}`) })),
          },
          {
            type: 'bubbleMap',
            label: 'Data centers',
            outline: countries,
            data: data.points.map(p => ({ longitude: p.longitude, latitude: p.latitude, value: 1 })),
            // Points are a transparent gray by default, so they get the first color of the Chart.js default palette
            backgroundColor: '#36a2eb',
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        showOutline: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ctx.datasetIndex === 1
                ? `${data.points[ctx.dataIndex].name} data center`
                : `${ctx.chart.data.labels[ctx.dataIndex]}: ${formatUsers((ctx.raw as { value: number }).value)}`,
            },
          },
        },
        scales: {
          projection: { axis: 'x', projection: 'equalEarth' },
          color: { axis: 'x', ticks: { color: isDark ? '#aaa' : '#666' } },
          size: { axis: 'x', display: false },
        },
      }}
    />
  )
}
