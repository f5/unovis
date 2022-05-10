import { AfterViewInit, Component, ViewChild, ElementRef } from '@angular/core'
import { sum, max } from 'd3-array'
import _groupBy from 'lodash/groupBy'
import _times from 'lodash/times'
import _sample from 'lodash/sample'

// Vis
import {
  SingleContainer,
  Sankey,
  SankeyConfigInterface,
  Sizing,
  SankeyNodeAlign,
  SankeyExitTransitionType,
  SankeyEnterTransitionType,
  VisControlItemInterface,
  VisControlsOrientation,
  Tooltip,
  Position,
  VerticalAlign,
  SankeySubLabelPlacement,
} from '@volterra/vis'

import data from './data/apieplist_ves-prod.json'

const apiData = data.apiep_list

const NODE_WIDTH = 30
const NODE_HORIZONTAL_SPACE = 260

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
  margin = { top: 0, bottom: 0, left: 30, right: 0 }
  fitToWidth = false
  fitToWidthScale = 1

  config: SankeyConfigInterface<any, any> = {
    labelPosition: Position.Right,
    labelVerticalAlign: VerticalAlign.Middle,
    labelBackground: false,
    nodeHorizontalSpacing: NODE_HORIZONTAL_SPACE,
    nodeWidth: NODE_WIDTH,
    nodeAlign: SankeyNodeAlign.Left,
    iconColor: '#e9edfe',
    nodePadding: 50,
    nodeMinHeight: 6,
    // labelColor: d => '#0D1C5B', // d.dynExamples.length ? '#4c52ca' : null,
    labelCursor: 'pointer',
    // subLabelColor: this.getSubLabelColor,
    label: d => d.isLeafNode ? d.method : `${d.leafs} ${d.leafs === 1 ? 'Leaf' : 'Leaves'}`,
    subLabel: d => d.label,
    nodeColor: d => d.isLeafNode ? _sample(['#0D1C5B', '#FF8400', '#FFCC09']) : null,
    subLabelFontSize: 14,
    labelFontSize: 14,
    labelMaxWidth: NODE_HORIZONTAL_SPACE - 40,
    subLabelPlacement: SankeySubLabelPlacement.Below,
    nodeCursor: 'pointer',
    linkCursor: 'pointer',
    nodeIcon: d => (d.sourceLinks[0] || (!d.sourceLinks[0] && d.collapsed)) ? (d.collapsed ? '+' : '') : null,
    // iconColor: 'white',
    exitTransitionType: SankeyExitTransitionType.ToAncestor,
    enterTransitionType: SankeyEnterTransitionType.FromAncestor,
    singleNodePosition: Position.Left,
    highlightSubtreeOnHover: true,
    nodeSort: (a, b) => {
      const aParent = a.targetLinks[0]?.source
      const bParent = b.targetLinks[0]?.source
      const aGrandparent = a.targetLinks[0]?.source?.targetLinks[0]?.source
      const bGrapdparent = b.targetLinks[0]?.source?.targetLinks[0]?.source

      if ((aParent === bParent)) { // Same parent nodes are sorted by: value + alphabetically
        return (b.value - a.value) || this.compareStrings(a?.path, b?.path)
      } else { // Different parent nodes are sorted by: 1st grandparent value + 1st parent value + alphabetically
        return (bGrapdparent?.value - aGrandparent?.value) || (bParent?.value - aParent?.value) || -this.compareStrings(aParent?.path, bParent?.path)
      }
    },
    linkSort: (a, b) => {
      return b.value - a.value || this.compareStrings(a.target?.path, b.target?.path) // Links sorted by: value + alphabetically
    },
    events: {
      [Sankey.selectors.background]: {
        // eslint-disable-next-line no-console
        click: () => { console.log('Background click!') },
      },
      [Sankey.selectors.gNode]: {
        click: (d: any) => {
          if (!d.targetLinks?.[0] || (!this.collapsedItems[d.id] && !d.sourceLinks?.[0])) return
          this.collapsedItems[d.id] = !this.collapsedItems[d.id]
          this.data = this.process(apiData)
          this.sankey.setData(this.data)
        },
      },
    },
  }

  component = new Sankey(this.config)

  containerConfig = {
    component: this.component,
    sizing: Sizing.Extend,
    margin: this.margin,
    tooltip: new Tooltip({
      horizontalPlacement: Position.Center,
      verticalPlacement: Position.Top,
      horizontalShift: 0,
      verticalShift: 25,
      triggers: {
        // [Sankey.selectors.gNode]: d => this.getTooltipContent(d),
      },
    }),
  }

  controlItems: VisControlItemInterface[] = [
    {
      icon: '&#xe986',
      callback: () => {
        this.fitToWidth = !this.fitToWidth
        this.containerConfig.sizing = this.fitToWidth ? Sizing.FitWidth : Sizing.Extend

        this.sankey.update(this.containerConfig)

        this.controlItems[0].icon = this.fitToWidth ? '&#xe926' : '&#xe986'
        this.controlItems = [...this.controlItems]

        this.fitToWidthScale = this.fitToWidth ? Math.min(this.sankey.getFitWidthScale(), 1) : 1
        const legendFullWidth = this.sankeyFullWidth - NODE_HORIZONTAL_SPACE + NODE_WIDTH / 2
        this.flowlegendWidth = legendFullWidth * this.fitToWidthScale
      },
    },
  ]

  controlsOrientation = VisControlsOrientation.Vertical

  collapsedItems: { [key: string]: boolean } = {}
  sankeyData: { nodes: any[]; links: any[] } = this.process(apiData)
  sankeyFullWidth: number
  maxDepth = max(this.sankeyData.nodes, n => n.depth) + 1
  // eslint-disable-next-line no-irregular-whitespace
  flowlegendItems = _times(this.maxDepth, i => `Segment ${i + 1}`)
  flowlegendWidth = 0;

  ngAfterViewInit (): void {
    // eslint-disable-next-line no-console
    console.log({ apiData, sankeyData: this.sankeyData })

    this.sankey = new SingleContainer(this.chart.nativeElement, this.containerConfig, this.sankeyData)
    setTimeout(() => {
      this.sankeyFullWidth = this.sankey.component.getWidth()
      this.flowlegendWidth = this.sankeyFullWidth - NODE_HORIZONTAL_SPACE + NODE_WIDTH / 2
    }, 50)
  }

  process (apiData: any[]): { nodes: any[]; links: any[] } {
    const nodes = []
    const links = []

    const getNodeId = (path, depth, method): string => `${depth}:${path}:${method}`
    for (const rec of apiData) {
      const value = rec.value ?? 1

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

        const isLeafNode = i === splitted.length - 1
        const method = isLeafNode ? rec.method : ''
        const depth = i
        const id = getNodeId(path, depth, method)
        const collapsed = this.collapsedItems[id]

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
          method,
          dynExamples,
          value,
        })
        if (collapsed) break
      }

      // Add new links { id, source, target, value }
      path = `/${splitted[0]}`
      for (let i = 1; i < splitted.length; i += 1) {
        const sourcePath = path
        const targetPath = `${path}/${splitted[i]}`
        const isTargetALeaf = i === splitted.length - 1
        const source = getNodeId(sourcePath, i - 1, '')
        const target = getNodeId(targetPath, i, isTargetALeaf ? rec.method : '')
        const id = `${source}~${target}`
        links.push({ id, source, target, value })
        path = targetPath
      }
    }

    // Groups nodes and links with the same id (depth : path)
    const groupedNodes = Object.values(_groupBy(nodes, 'id')) as any[]
    const groupedLinks = Object.values(_groupBy(links, 'id')) as any[]

    return {
      nodes: groupedNodes.map(nodeArr => ({
        ...nodeArr[0],
        leafs: nodeArr.length,
        fixedValue: sum(nodeArr.map(n => n.value)), // Sum up link values
      })),
      links: groupedLinks.map(linkArr => ({
        ...linkArr[0],
        value: sum(linkArr.map(l => l.value)), // Sum up link values
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

  onLegendItemClick ({ label, i }): void {
    const nodes = this.sankeyData.nodes.filter(node => !node.isLeafNode && node.depth === i)
    const hasExpanded = nodes.some(node => !this.collapsedItems[node.id])

    for (const node of nodes) {
      this.collapsedItems[node.id] = hasExpanded
    }

    this.data = this.process(apiData)
    this.sankey.setData(this.data)
  }

  compareStrings (a = '', b = ''): number {
    const strA = a.toUpperCase()
    const strB = b.toUpperCase()

    if (strA < strB) return -1
    if (strA > strB) return 1
    return 0
  }
}
