// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component, ViewChild, ElementRef } from '@angular/core'
import { sum } from 'd3-array'
import _groupBy from 'lodash/groupBy'

// Vis
import { SingleChart, Sankey, SankeyConfigInterface, Sizing, LabelPosition, NodeAlignType, ExitTransitionType, EnterTransitionType, VisControlItemInterface, VisControlsOrientation } from '@volterra/vis'

import data from './data/apieplist_ves-prod.json'

const apiEpList = data.apiep_list.map(d => {
  return {
    ...d,
    value: 1, // Math.random(),
  }
})

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
  margin = { top: 0, bottom: 0, left: 20, right: 0 }
  config: SankeyConfigInterface<any, any> = {
    labelPosition: LabelPosition.RIGHT,
    nodeHorizontalSpacing: NODE_HORIZONTAL_SPACE,
    nodeWidth: NODE_WIDTH,
    nodeAlign: NodeAlignType.LEFT,
    sizing: Sizing.EXTEND,
    nodePadding: 28,
    nodeSubLabel: d => d.isLeafNode ? d.method : `${d.leafs} leaf${d.leafs === 1 ? '' : 's'}`,
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
  flowlegendItems = ['Segment 1', 'Segment 2', 'Segment 3', 'Segment 4', 'Segment 5', 'Segment 6', 'Segment 7']
  flowlegendWidth = 0;

  singleChartConfig = { component: this.component, margin: this.margin, fitToWidth: false }
  controlItems: VisControlItemInterface[] = [
    {
      icon: '&#xe986',
      callback: () => {
        this.singleChartConfig.fitToWidth = !this.singleChartConfig.fitToWidth
        this.sankey.update(this.singleChartConfig)

        this.controlItems[0].icon = this.singleChartConfig.fitToWidth ? '&#xe926' : '&#xe986'
        this.controlItems = [...this.controlItems]
        if (this.singleChartConfig.fitToWidth) {
          this.flowlegendWidth = this.sankey.containerWidth - NODE_HORIZONTAL_SPACE * this.sankey.fitScaleX
        } else {
          this.flowlegendWidth = this.sankey.component.getWidth() - NODE_HORIZONTAL_SPACE
        }
      },
    },
  ]

  controlsOrientation = VisControlsOrientation.VERTICAL

  ngAfterViewInit (): void {
    const apiData = apiEpList
    const sankeyData = this.process(apiData)
    console.log({ apiData, sankeyData })

    this.sankey = new SingleChart(this.chart.nativeElement, this.singleChartConfig, sankeyData)
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
      const url = rec.collapsed_url
      const splitted = url.split('/')

      // Add new nodes { id, path, url, label, depth }
      let path = ''
      for (let i = 0; i < splitted.length; i += 1) {
        const label = `/${splitted[i]}`
        path += label

        const depth = i
        const id = nodeId(path, depth)
        const collapsed = collasedItems[id]
        const isLeafNode = i === splitted.length - 1
        nodes.push({ id, path, url, label, depth, collapsed, isLeafNode, method: isLeafNode ? rec.method : '' })
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
      nodes: groupedNodes.map(nodeArr => ({ ...nodeArr[0], leafs: nodeArr.length })),
      links: groupedLinks.map(linkArr => ({
        ...linkArr[0],
        value: sum(linkArr.map(l => l.value)), // Sum up link values
      })),
    }
  }
}
