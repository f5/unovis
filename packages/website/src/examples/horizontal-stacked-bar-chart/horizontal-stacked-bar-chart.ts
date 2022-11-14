import { Axis, AxisType, BulletLegend, FitMode, Orientation, StackedBar, Tooltip, XYContainer } from '@unovis/ts'
import { data, EducationDatum, labels } from './data'

const isSmallScreen = window?.innerWidth < 768
const container = document.getElementById('vis-container')

const bar = new StackedBar<EducationDatum>({
  x: (d, i) => i,
  y: [d => d.bachelors, d => d.masters, d => d.doctoral],
  orientation: Orientation.Horizontal,
})

const legend = new BulletLegend(document.getElementById('vis-legend'), {
  items: Object.values(labels).map(v => ({ name: v })),
})

const chart = new XYContainer(container, {
  components: [bar],
  height: isSmallScreen ? 600 : 800,
  xAxis: new Axis({
    label: '% of population aged 25 or above',
  }),
  yAxis: new Axis({
    tickTextWidth: isSmallScreen ? 75 : null,
    tickTextFitMode: FitMode.Trim,
    tickFormat: (_, i: number) => data[i].country,
    label: isSmallScreen ? null : 'Country',
    numTicks: data.length,
  }),
  tooltip: new Tooltip({
    triggers: {
      [StackedBar.selectors.bar]: d => {
        const title = `<div style="color: #666; text-align: center">${d.country}</div`
        const total = `Total: <b>${d.total}%</b> of population with a college degree</br>`
        const stats = Object.keys(labels).map((l, i) => [
          labels[l].split(' ')[0],
          `<span style="color: var(--vis-color${i}); font-weight: 800">${d[l]}%</span>`,
        ].join(': ')).join(' | ')
        return `<div style="font-size: 12px">${title}${total}${stats}</div>`
      },
    },
  }),
}, data)
