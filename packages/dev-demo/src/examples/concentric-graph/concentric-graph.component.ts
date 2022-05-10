/* eslint-disable dot-notation */

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import { Graph, GraphLayoutType, Shape, SingleContainer } from '@volterra/vis'

type GraphNode = { id: string; label: string; group: string }
type GraphLink = { source: string; target: string }

@Component({
  selector: 'concentric-graph',
  templateUrl: './concentric-graph.component.html',
  styleUrls: ['./concentric-graph.component.css'],
})
export class ConcentricGraphComponent implements AfterViewInit {
  @ViewChild('graph', { static: false }) containerRef: ElementRef
  title = 'concentric-graph'
  component = new Graph<GraphNode, GraphLink>({
    layoutType: GraphLayoutType.Concentric,
    nodeSize: d => 30,
    nodeShape: Shape.Square,
    nodeIcon: d => d.label,
    nodeLabel: d => d.label,
    nodeGroup: d => d.group,
    nodeBorderWidth: 1,
    linkWidth: 1,
  })

  vis: SingleContainer<{nodes: GraphNode[]; links?: GraphLink[] }>

  ngAfterViewInit (): void {
    const nodes = this.generateNodes(15 + Math.round(150 * Math.random()))
    this.assignNodeGroups(nodes)
    const links = this.generateLinks(nodes)
    const data = { nodes, links }

    this.vis = new SingleContainer<{nodes: GraphNode[]; links?: GraphLink[] }>(this.containerRef.nativeElement, { component: this.component }, data)
  }

  generateNodes (n = 50): GraphNode[] {
    return Array(n).fill(0).map((_, i) => ({
      id: `${Math.random()}`,
      label: `${i}`,
      group: '',
    }))
  }

  generateLinks (nodes: GraphNode[], numCentralNodes = 2): GraphLink[] {
    const links: GraphLink[] = []
    nodes.forEach((node, i) => {
      if (i > numCentralNodes) {
        for (let j = 0; j < numCentralNodes; j += 1) {
          links.push({ source: nodes[i].id, target: nodes[j].id })
        }
      }
    })

    return links
  }

  assignNodeGroups (
    nodes: GraphNode[],
    numCentralNodes = 2,
    circleToCircleMultiplier = 1.35,
    firstCircleNumNodesCliff = 35,
    firstCircleMaxNodes = 25,
    firstCircleMinNodes = 15
  ): void {
    let firstCircleNumNodes: number

    // First we find the optimal number of nodes for the first circle, assuming that each next circle will have
    //   `circleToCircleMultiplier` more nodes than the previous one
    if ((nodes.length - numCentralNodes) < firstCircleNumNodesCliff) firstCircleNumNodes = firstCircleNumNodesCliff
    else {
      firstCircleNumNodes = firstCircleMaxNodes
      let diffGlobal = Number.POSITIVE_INFINITY
      for (let n = firstCircleMaxNodes; n > firstCircleMinNodes; n -= 1) {
        let nNodes = n
        let nTotal = nNodes
        let diff = Number.NEGATIVE_INFINITY
        while (diff < 0) {
          nNodes = Math.round(nNodes * circleToCircleMultiplier)
          nTotal += nNodes
          diff = nTotal - (nodes.length - numCentralNodes)
        }

        if (diff < diffGlobal) {
          diffGlobal = diff
          firstCircleNumNodes = n
        }

        if (diff === 0) break
      }
    }

    // Knowing the number of nodes for the first circle we can assign the groups
    let count = 0
    let group = 0
    let numNodesPerCircle = firstCircleNumNodes
    nodes.forEach((node, i) => {
      // Handle central nodes
      if (i < numCentralNodes) {
        node.group = 'central'
        return
      }

      // Assign concentric circle groups
      node.group = `circle-${group}`
      count += 1

      // Increment group and the number of nodes for the next circle
      if (count > numNodesPerCircle) {
        group += 1
        count = 0
        numNodesPerCircle = Math.round(numNodesPerCircle * circleToCircleMultiplier)
      }
    })
  }
}
