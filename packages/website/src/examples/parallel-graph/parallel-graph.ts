import { BulletLegend, colors, Graph, GraphLinkArrowStyle, GraphLayoutType, Position, Scale, SingleContainer, Tooltip, GraphNode } from '@unovis/ts'
import { data, groups, styleUrl, getFlag, NodeDatum, LinkDatum } from './data'

const colorScale = Scale.scaleOrdinal<string>(colors).domain(groups)
const getColor = (d: NodeDatum | LinkDatum['airline']): string => colorScale(d.continent)

const graphPanels = groups.map(c => ({
  nodes: data.nodes.reduce((arr, n) => n.continent === c ? [...arr, n.id] : arr, []),
  label: c,
  borderColor: colorScale(c),
  dashedOutline: true,
  labelPosition: c === 'North America' || c === 'Asia' || c === 'Africa'
    ? Position.Top
    : Position.Bottom
  ,
}))

const container = document.getElementById('#vis-container')
container.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${styleUrl}">`)

const legend = new BulletLegend(container, {
  items: groups.map(d => ({ name: d, color: colorScale(d) })),
})

const chart = new SingleContainer(container, {
  height: 750,
  margin: { top: 20, bottom: 20, left: 20, right: 20 },
  component: new Graph<NodeDatum, LinkDatum>({
    layoutType: GraphLayoutType.Parallel,
    layoutParallelNodeSubGroup: (n: NodeDatum) => n.continent,
    layoutParallelNodesPerColumn: 5,
    layoutParallelGroupSpacing: 200,
    linkArrow: GraphLinkArrowStyle.Single,
    linkStroke: (l: LinkDatum) => getColor(l.airline),
    nodeFill: getColor,
    nodeIcon: (n: GraphNode<NodeDatum, LinkDatum>) => String(n.links.length),
    panels: graphPanels,
  }),
  tooltip: new Tooltip({
    triggers: {
      [Graph.selectors.link]: l => `
          <div style="color:#333">
            <div>${l.source.label} -> ${l.target.label}</div>
            <div style="font-size:12px">
              ${getFlag(l.airline.countryCode)}${l.airline.name} |
              <span style="font-variant:all-small-caps">${[l.airline.country, l.airline.continent].join(', ')}
            </div>
          </div>`
      ,
    },
  }),
}, data)
