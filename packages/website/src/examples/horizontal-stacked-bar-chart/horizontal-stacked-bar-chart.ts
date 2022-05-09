import { BulletLegend, Orientation, StackedBar, Tooltip, XYContainer } from '@volterra/vis'
import { data, labels, EducationDatum } from './data'

const container = document.getElementById('#vis-container')

const bar = new StackedBar<EducationDatum>({
  x: (d, i) => i,
  y: [d => d.bachelors, d => d.masters, d => d.doctoral],
  orientation: Orientation.Vertical,
})

const legend = new BulletLegend(document.getElementById('#vis-legend'), {
  items: Object.values(labels).map(v => ({ name: v })),
})

const chart = new XYContainer(container, {
  components: [bar],
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
