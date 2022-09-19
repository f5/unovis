import { Component } from '@angular/core'
import { colors, Graph, GraphLayoutType,   GraphLinkArrowStyle, GraphNode, Position, Scale } from '@unovis/ts'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

import { data, groups, styleUrl, getFlag, NodeDatum, LinkDatum } from './data'

const colorScale = Scale.scaleOrdinal<string>(colors).domain(groups)

@Component({
  selector: 'parallel-graph',
  templateUrl: './parallel-graph.component.html'
})
export class ParallelGraphComponent {
  data = data
  style: SafeResourceUrl
  margin = { top: 20, bottom: 20, left: 20, right: 20 }

  constructor(sanitizer: DomSanitizer) {
    this.style = sanitizer.bypassSecurityTrustResourceUrl(styleUrl)
  }

  getColor = (d: NodeDatum | LinkDatum['airline']): string => colorScale(d.continent)

  layoutType = GraphLayoutType.Parallel
  layoutParallelNodeSubGroup = (n: NodeDatum) => n.continent
  linkArrow=GraphLinkArrowStyle.Single
  linkStroke = (l: LinkDatum) => this.getColor(l.airline)
  nodeIcon = (n: GraphNode<NodeDatum,LinkDatum>) => n.links.length.toString()
  graphPanels = groups.map(c => ({
    nodes: data.nodes.reduce((arr, n) => n.continent === c ? [...arr, n.id] : arr, []),
    label: c,
    borderColor: colorScale(c),
    dashedOutline: true,
    labelPosition: c === 'North America' || c === 'Asia' || c === 'Africa'
      ? Position.Top
      : Position.Bottom
    ,
  }))

  legendItems = groups.map(d => ({ name: d, color: colorScale(d) }))
  tooltipTriggers = {
    [Graph.selectors.link]: l => `
        <div style="color:#333">
          <div>${l.source.label} -> ${l.target.label}</div>
          <div style="font-size:12px">
            ${getFlag(l.airline.countryCode)}${l.airline.name} |
            <span style="font-variant:all-small-caps">${[l.airline.country, l.airline.continent].join(', ')}
          </div>
        </div>`
    ,
  }
}
