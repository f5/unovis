import React, { useMemo, useRef } from 'react'
import { Chart, CategoryScale, LinearScale, BarElement, Colors, Legend, Tooltip, TooltipItem } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import annotationPlugin, { AnnotationOptions } from 'chartjs-plugin-annotation'

import type { ChartProps } from '../types'
import { DAY, DEPLOYMENT_ICON_PATH, ICON_SIZE, ICON_VIEW_BOX, INCIDENT_ICON_PATH, WEEK_END, WEEK_START } from './constants'
import { TimelineEvent, kinds, services, formatDay, formatRange, getKindLabel } from './data'

// The annotation plugin adds its annotation types to Chart.js only when it's registered, so it can't be passed to one chart.
// It draws nothing on a chart that sets no annotations
Chart.register(CategoryScale, LinearScale, BarElement, Colors, Legend, Tooltip, annotationPlugin)

type Item = { x: [number, number]; y: string; event: TimelineEvent }

// The Colors plugin's colors for the first two datasets, Deployment and Incident, for the icons
const iconColors = { deployment: 'rgb(54, 162, 235)', incident: 'rgb(255, 99, 132)' }
const iconImage = (path: string, color: string): HTMLImageElement => {
  const image = new Image(ICON_SIZE, ICON_SIZE)
  image.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ICON_VIEW_BOX}"><path d="${path}" fill="${color}"/></svg>`)}`
  return image
}

export default function ChartJsTimeline ({ data, isDark, preset }: ChartProps<TimelineEvent[]>): JSX.Element {
  const chartRef = useRef<Chart<'bar', Item[]>>(null)
  const textColor = isDark ? '#aaa' : '#666'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  // A point annotation can draw an image, which loads asynchronously: the chart redraws once it's there
  const icons = useMemo(() => {
    const images = { deployment: iconImage(DEPLOYMENT_ICON_PATH, iconColors.deployment), incident: iconImage(INCIDENT_ICON_PATH, iconColors.incident) }
    Object.values(images).forEach(image => { image.onload = () => chartRef.current?.update() })
    return images
  }, [])

  // Annotations don't follow the legend, so each one checks that the datasets it belongs to are visible
  const isVisible = (...kindIndices: number[]) => ({ chart }: { chart: Chart }): boolean => kindIndices.every(i => chart.isDatasetVisible(i))
  const deploymentIndex = kinds.findIndex(k => k.key === 'deployment')
  const incidentIndex = kinds.findIndex(k => k.key === 'incident')
  const annotations: AnnotationOptions[] = []
  if (preset === 'arrows') {
    data.filter(d => d.causeId).forEach(d => {
      const cause = data.find(c => c.id === d.causeId)
      annotations.push({
        type: 'line',
        xMin: cause.end,
        xMax: d.start,
        yMin: cause.service,
        yMax: d.service,
        borderColor: textColor,
        borderWidth: 1.5,
        arrowHeads: { end: { display: true, length: 8, width: 4 } },
        display: isVisible(deploymentIndex, incidentIndex),
      })
    })
  }
  if (preset === 'icons') {
    data.filter(d => d.kind === 'deployment' || d.kind === 'incident').forEach(d => {
      const isDeployment = d.kind === 'deployment'
      annotations.push({
        type: 'point',
        xValue: isDeployment ? d.end : d.start,
        yValue: d.service,
        pointStyle: icons[d.kind],
        xAdjust: (isDeployment ? 1 : -1) * ICON_SIZE / 2,
        display: isVisible(isDeployment ? deploymentIndex : incidentIndex),
      })
    })
  }

  return (
    <Bar
      ref={chartRef}
      data={{
        labels: services,
        // Floating bars: every item is an [start, end] range in its service's row
        datasets: kinds.map(k => ({
          label: k.label,
          data: data.filter(d => d.kind === k.key).map(d => ({ x: [d.start, d.end], y: d.service, event: d })),
          // Bars of different datasets in the same row would sit side by side
          grouped: false,
          borderRadius: preset === 'rounded' ? Number.MAX_VALUE : 0,
          borderSkipped: preset === 'rounded' ? false : undefined,
        })),
      }}
      options={{
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: {
            callbacks: {
              title: (items: TooltipItem<'bar'>[]) => (items[0].raw as Item).event.title,
              label: (item: TooltipItem<'bar'>) => {
                const d = (item.raw as Item).event
                return [`${d.service} · ${getKindLabel(d.kind)}`, formatRange(d)]
              },
            },
          },
          annotation: { annotations },
        },
        scales: {
          // A time scale needs a date adapter package, a linear scale with day steps and a tick formatter does without
          x: { type: 'linear', min: WEEK_START, max: WEEK_END, ticks: { stepSize: DAY, color: textColor, callback: (value: string | number) => formatDay(+value) }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } },
        },
      }}
    />
  )
}
