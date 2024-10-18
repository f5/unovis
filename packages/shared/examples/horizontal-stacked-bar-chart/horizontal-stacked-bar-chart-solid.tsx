import { JSX } from 'solid-js'
import { Direction, FitMode, Orientation, StackedBar } from '@unovis/ts'
import { VisAxis, VisBulletLegend, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/solid'

import { data, EducationDatum, labels } from './data'

const horizontalStackedBarChart = (): JSX.Element => {
  const chartLabels = Object.entries(labels).map(([k, v], i) => ({
    key: k,
    legend: v,
    tooltip: (d: EducationDatum) =>
      [
        v.split(' ')[0],
        `<span style="color: var(--vis-color${i}); font-weight: 800">${d[k]}%</span>`,
      ].join(': '),
  }))

  const isSmallScreen = window?.innerWidth < 768
  const x = (d: EducationDatum, i: number) => i
  const y = chartLabels.map((i) => (d: EducationDatum) => d[i.key])
  const tickFormat = (_: EducationDatum, i: number) => data[i].country

  function tooltipTemplate (d: EducationDatum): string {
    const title = `<div style="color: #666; text-align: center">${d.country}</div>`
    const total = `Total: <b>${d.total}%</b> of population with a college degree</br>`
    const stats = chartLabels.map((l) => l.tooltip(d)).join(' | ')
    return `<div style="font-size: 12px">${title}${total}${stats}</div>`
  }

  return (
    <div>
      <h3>Highest Degree Earned across Country Populations as of 2020</h3>
      <VisBulletLegend items={chartLabels.map((d) => ({ name: d.legend }))} />
      <VisXYContainer height='50dvh' yDirection={Direction.South}>
        <VisStackedBar
          data={data}
          x={x}
          y={y}
          orientation={Orientation.Horizontal}
        />
        <VisTooltip
          triggers={{ [StackedBar.selectors.bar]: tooltipTemplate }}
        />
        <VisAxis type='x' label='% of population aged 25 or above' />
        <VisAxis
          type='y'
          tickTextWidth={75}
          tickTextFitMode={FitMode.Trim}
          label='Country'
          numTicks={data.length}
          tickFormat={tickFormat}
        />
      </VisXYContainer>
    </div>
  )
}

export default horizontalStackedBarChart
