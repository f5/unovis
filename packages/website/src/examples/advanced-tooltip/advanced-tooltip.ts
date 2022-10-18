import { Crosshair, StackedBar, Tooltip, XYContainer } from '@unovis/ts'
import { data, categories } from './data'

const container = document.getElementById('vis-container')

const tooltip = new Tooltip({
  container: document.body,
})

const components = categories.map(c => new XYContainer(container, {
  height: 100,
  components: [
    new StackedBar({
      x: d => d.year,
      y: d => d[c],
      events: {
        [StackedBar.selectors.bar]: {
          mouseover: (e) => {
            console.log(e, tooltip)
            tooltip.show(e.year, { x: 500, y: 200 })
          },
          mouseout: () => tooltip.hide(),
        },
      }
    }),
  ],
  crosshair: new Crosshair(),
}, data))

