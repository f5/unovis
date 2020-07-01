// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component, ViewChild, ElementRef } from '@angular/core'
import { sum } from 'd3-array'
import _groupBy from 'lodash/groupBy'

// Vis
import {
  SingleChart, Sankey, SankeyConfigInterface, Sizing, LabelPosition, NodeAlignType, ExitTransitionType,
  EnterTransitionType, VisControlItemInterface, VisControlsOrientation, Tooltip, Position,
} from '@volterra/vis'

import data from './data/apieplist_ves-prod.json'

const apiEpList = data.apiep_list.map(d => {
  return {
    ...d,
    value: 1, // Math.random(),
  }
})

const NODE_WIDTH = 30
const NODE_HORIZONTAL_SPACE = 300

@Component({
  selector: 'api-endpoint-explorer',
  templateUrl: './api-endpoint-explorer.component.html',
  styleUrls: ['./api-endpoint-explorer.component.scss'],
})

export class ApiEndpointExplorerComponent implements AfterViewInit {
  @ViewChild('chart', { static: false }) chart: ElementRef
  title = 'api-endpoint-explorer'
  sankey: any
  data = {}
  margin = { top: 0, bottom: 0, left: 0, right: 0 }
  fitToWidth = false

  config: SankeyConfigInterface<any, any> = {
    labelPosition: LabelPosition.RIGHT,
    nodeHorizontalSpacing: NODE_HORIZONTAL_SPACE,
    nodeWidth: NODE_WIDTH,
    nodeAlign: NodeAlignType.LEFT,
    nodePadding: 28,
    subLabelColor: this.getSubLabelColor,
    subLabel: d => d.isLeafNode ? d.method : `${d.leafs} leaf${d.leafs === 1 ? '' : 's'}`,
    nodeIcon: d => (d.sourceLinks[0] || (!d.sourceLinks[0] && d.collapsed)) ? (d.collapsed ? '+' : '') : null,
    // iconColor: 'white',
    exitTransitionType: ExitTransitionType.TO_ANCESTOR,
    enterTransitionType: EnterTransitionType.FROM_ANCESTOR,
    events: {
      [Sankey.selectors.gNode]: {
        click: (d: any) => {
          if (!d.targetLinks?.[0] || (!this.collapsedItems[d.id] && !d.sourceLinks?.[0])) return
          this.collapsedItems[d.id] = !this.collapsedItems[d.id]
          this.data = this.process(apiEpList)
          this.sankey.setData(this.data)
        },
      },
    },
  }

  component = new Sankey(this.config)
  flowlegendItems = ['Segment 1', 'Segment 2', 'Segment 3', 'Segment 4', 'Segment 5', 'Segment 6', 'Segment 7']
  flowlegendWidth = 0;

  containerConfig = {
    component: this.component,
    sizing: Sizing.EXTEND,
    margin: this.margin,
    tooltip: new Tooltip({
      horizontalPlacement: Position.RIGHT,
      verticalPlacement: Position.CENTER,
      horizontalShift: 15,
      triggers: {
        [Sankey.selectors.gNode]: d => this.getTooltipContent(d),
      },
    }),
  }

  controlItems: VisControlItemInterface[] = [
    {
      icon: '&#xe986',
      callback: () => {
        this.fitToWidth = !this.fitToWidth
        this.containerConfig.sizing = this.fitToWidth ? Sizing.FIT_WIDTH : Sizing.EXTEND

        this.sankey.update(this.containerConfig)

        this.controlItems[0].icon = this.fitToWidth ? '&#xe926' : '&#xe986'
        this.controlItems = [...this.controlItems]

        const legendFullWidth = this.sankey.component.getWidth() - NODE_HORIZONTAL_SPACE + NODE_WIDTH / 2
        this.flowlegendWidth = legendFullWidth * (this.fitToWidth ? this.sankey.getFitWidthScale() : 1)
      },
    },
  ]

  controlsOrientation = VisControlsOrientation.VERTICAL

  collapsedItems: { [key: string]: boolean } = {};

  ngAfterViewInit (): void {
    const apiData = apiEpList
    const sankeyData = this.process(apiData)
    console.log({ apiData, sankeyData })

    this.sankey = new SingleChart(this.chart.nativeElement, this.containerConfig, sankeyData)
    setTimeout(() => {
      this.flowlegendWidth = this.sankey.component.getWidth() - NODE_HORIZONTAL_SPACE + NODE_WIDTH / 2
    }, 50)
  }

  process (apiData: any[]): { nodes: any[]; links: any[] } {
    const nodes = []
    const links = []

    const getNodeId = (path, depth): string => `${depth}:${path}`
    for (const rec of apiData) {
      const value = 1
      let url = rec.collapsed_url
      const isPartOfOtherUrl = apiData.find(
        r => r.collapsed_url !== url && r.collapsed_url?.includes(url)
      )

      // Remove trailing slash if any
      if (url.slice(-1) === '/') {
        url = url.slice(0, -1)
      }

      // Add a slash for creating an extra node if current URL is also
      //  a part of other URLs
      if (isPartOfOtherUrl) {
        url += '/'
      }

      // Split string to get nodes
      const splitted = url.split('/')

      // Add new nodes { id, path, url, label, depth }
      let path = ''
      for (let i = 0; i < splitted.length; i += 1) {
        const pathSegment = `/${splitted[i]}`
        path += pathSegment
        const label = pathSegment.replace('$DYN$', '<dynamic component>')

        const depth = i
        const id = getNodeId(path, depth)
        const collapsed = this.collapsedItems[id]
        const isLeafNode = i === splitted.length - 1

        const dyn = rec.dyn_examples?.find(ex => ex.component_identifier === path.slice(1))
        // eslint-disable-next-line camelcase
        const dynExamples = dyn?.component_examples ?? []

        nodes.push({
          id,
          path,
          url,
          label,
          depth,
          collapsed,
          isLeafNode,
          method: isLeafNode ? rec.method : '',
          dynExamples,
        })
        if (collapsed) break
      }

      // Add new links { id, source, target, value }
      path = `/${splitted[0]}`
      for (let i = 1; i < splitted.length; i += 1) {
        const sourcePath = path
        const targetPath = `${path}/${splitted[i]}`
        const source = getNodeId(sourcePath, i - 1)
        const target = getNodeId(targetPath, i)
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
        value: sum(linkArr.map(l => 1)), // Sum up link values
      })),
    }
  }

  getTooltipContent (d): string {
    return `<table>
      <tr class="item">
        <td class="label">Path: </td>
        <td class="content">${d.path.replace('//', '/')}</td>
      </tr>
      ${
        d.dynExamples?.length
          ? `<tr class="item">
        <td class="label">Example DYNs: </td>
        <td class="content">${d.dynExamples?.[0]}</td>
      </tr>`
          : ''
}
      ${
  d.method
    ? `<tr class="item">
        <td class="label">Method: </td>
        <td class="content">${d.method}</td>
      </tr>`
    : ''
}
      ${d.dynExamples
        ?.slice(1)
        .map(
          str => `<tr class="item">
        <td class="label"></td>
        <td class="content">${str}</td>
      </tr>`
        )
        .join('')}
      </table>`
  }

  getSubLabelColor (d): string {
    if (!d.isLeafNode) return '#888'

    switch (d.method) {
    case 'GET': return '#50a6fe'
    case 'POST': return '#05c66c'
    case 'PUT': return '#fc8d04'
    case 'DELETE': return '#e64f48'
    default: return null
    }
  }
}
