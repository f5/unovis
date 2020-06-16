// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component, ViewChild, ElementRef } from '@angular/core'
import { sum } from 'd3-array'
import _groupBy from 'lodash/groupBy'

// Vis
import { SingleChart, Sankey, SankeyConfigInterface, Sizing, LabelPosition, NodeAlignType, ExitTransitionType, EnterTransitionType } from '@volterra/vis'

import data from './data/apieplist_ves.json'

const apiEpList = data.api_ep_list.map(d => {
  return {
    ...d,
    value: Math.random(),
  }
}).slice(0, 4)

const collasedItems = {}

const NODE_WIDTH = 30
const NODE_HORIZONTAL_SPACE = 300

@Component({
  selector: 'api-endpoint-explorer',
  templateUrl: './api-endpoint-explorer.component.html',
  styleUrls: ['./api-endpoint-explorer.component.css'],
})

export class ApiEndpointExplorerComponent implements AfterViewInit {
  @ViewChild('chart', { static: false }) chart: ElementRef
  title = 'api-endpoint-explorer'
  sankey: any
  data = {}
  margin = { left: 20 }
  config: SankeyConfigInterface<any, any> = {
    labelPosition: LabelPosition.RIGHT,
    nodeHorizontalSpacing: NODE_HORIZONTAL_SPACE,
    nodeWidth: NODE_WIDTH,
    nodeAlign: NodeAlignType.LEFT,
    sizing: Sizing.EXTEND,
    nodePadding: 10,
    nodeSubLabel: d => `${d.value.toFixed(1)} KB`,
    nodeIcon: d => (d.sourceLinks[0] || (!d.sourceLinks[0] && d.collapsed)) ? (d.collapsed ? '+' : '') : null,
    // iconColor: 'white',
    exitTransitionType: ExitTransitionType.TO_ANCESTOR,
    enterTransitionType: EnterTransitionType.FROM_ANCESTOR,
    events: {
      [Sankey.selectors.gNode]: {
        click: d => {
          if (!d.targetLinks[0] || (!collasedItems[d.id] && !d.sourceLinks[0])) return
          collasedItems[d.id] = !collasedItems[d.id]
          const sankeyData = this.process(apiEpList)
          this.sankey.setData(sankeyData)
        },
      },
    },
  }

  component = new Sankey(this.config)
  flowlegendItems = ['Segment 1', 'Segment 2', 'Segment 3', 'Segment 4', 'Segment 5', 'Segment 6']
  flowlegendWidth = 0;

  ngAfterViewInit (): void {
    const apiData = apiEpList
    const sankeyData = this.process(apiData)
    console.log({ apiData, sankeyData })

    this.sankey = new SingleChart(this.chart.nativeElement, { component: this.component, margin: this.margin }, sankeyData)
    setTimeout(() => {
      this.flowlegendWidth = this.sankey.component.getWidth() - NODE_HORIZONTAL_SPACE
    }, 50)
  }

  process (apiData) {
    const nodes = []
    const links = []

    const nodeId = (path, depth) => `${depth}:${path}`
    for (const rec of apiData) {
      const value = rec.value // Math.random()
      const url = rec.url
      const splitted = url.split('/')

      // Add new nodes { id, path, url, label, depth }
      let path = ''
      for (let i = 0; i < splitted.length; i += 1) {
        const label = `/${splitted[i]}`
        path += label

        const depth = i
        const id = nodeId(path, depth)
        const collapsed = collasedItems[id]
        nodes.push({ id, path, url, label, depth, collapsed })
        if (collapsed) break
      }

      // Add new links { id, source, target, value }
      path = `/${splitted[0]}`
      for (let i = 1; i < splitted.length; i += 1) {
        const sourcePath = path
        const targetPath = `${path}/${splitted[i]}`
        const source = nodeId(sourcePath, i - 1)
        const target = nodeId(targetPath, i)
        const id = `${source}~${target}`
        links.push({ id, source, target, value })
        path = targetPath
      }
    }

    // Groups nodes and links with the same id (depth : path)
    const groupedNodes = Object.values(_groupBy(nodes, 'id')) as any[]
    const groupedLinks = Object.values(_groupBy(links, 'id')) as any[]

    return {
      nodes: groupedNodes.map(nodeArr => ({ ...nodeArr[0] })),
      links: groupedLinks.map(linkArr => ({
        ...linkArr[0],
        value: sum(linkArr.map(l => l.value)), // Sum up link values
      })),
    }
  }
}
