// Copyright (c) Volterra, Inc. All rights reserved.
import { isNumber, isUndefined, cloneDeep, isFunction, without, isString, isObject } from 'utils/data'

// Types
import { GraphInputLink, GraphInputNode, GraphLinkCore, GraphNodeCore } from 'types/graph'

// Core Data Model
import { CoreDataModel } from './core'

export class GraphDataModel<
  N extends GraphInputNode,
  L extends GraphInputLink,
  OutNode extends GraphNodeCore<N, L> = GraphNodeCore<N, L>,
  OutLink extends GraphLinkCore<N, L> = GraphLinkCore<N, L>,
> extends CoreDataModel<{nodes: N[]; links?: L[]}> {
  private _nonConnectedNodes: OutNode[]
  private _connectedNodes: OutNode[]
  private _nodes: OutNode[] = []
  private _links: OutLink[] = []

  // Model configuration
  public nodeId: ((n: N) => string) = n => `${n.id}`
  public linkId: ((n: L) => string) = l => `${l.id}`
  public nodeSort: ((a: N, b: N) => number)

  // eslint-disable-next-line accessor-pairs
  set data (inputData: { nodes: N[]; links?: L[]}) {
    if (!inputData) return
    const prevNodes = this.nodes
    const prevLinks = this.links

    const nodes: OutNode[] = cloneDeep(inputData?.nodes ?? [])
    const links: OutLink[] = cloneDeep(inputData?.links ?? [])

    // Every node or link can have a private state used for rendering needs
    // On data update we transfer state between objects with same ids
    this.transferState(nodes, prevNodes, this.nodeId)
    this.transferState(links, prevLinks, this.linkId)

    // Set node `_id` and `_index`
    nodes.forEach((node, i) => {
      node._index = i
      node._id = this.nodeId(node) || `${i}`
    })

    // Sort nodes
    if (isFunction(this.nodeSort)) nodes.sort(this.nodeSort)

    // Fill link source and target
    links.forEach((link, i) => {
      link.source = this.findNode(nodes, link.source)
      link.target = this.findNode(nodes, link.target)
    })

    // Set link index for multiple link rendering
    links.forEach((link, i) => {
      if (!isUndefined(link._index) && !isUndefined(link._neighbours)) return

      const linksFiltered = links.filter(l =>
        ((link.source === l.source) && (link.target === l.target)) ||
        ((link.source === l.target) && (link.target === l.source))
      )

      linksFiltered.forEach((l, i) => {
        l._index = i
        l._id = this.linkId(l) || `${l.source?._id}-${l.target?._id}-${i}`
        l._neighbours = linksFiltered.length
        l._direction = ((link.source === l.source) && (link.target === l.target)) ? 1 : -1
      })
    })

    // Determine if a node is connected or not and store it as a property
    nodes.forEach(d => {
      d.links = links.filter(l => (l.source === d) || (l.target === d))
      d._isConnected = d.links.length !== 0
    })

    this._nonConnectedNodes = nodes.filter(d => !d._isConnected)
    this._connectedNodes = without(nodes, ...this._nonConnectedNodes)

    this._nodes = nodes
    this._links = links.filter(l => l.source && l.target)
  }

  get nodes (): OutNode[] {
    return this._nodes
  }

  get links (): OutLink[] {
    return this._links
  }

  get connectedNodes (): OutNode[] {
    return this._connectedNodes
  }

  get nonConnectedNodes (): OutNode[] {
    return this._nonConnectedNodes
  }

  private findNode (nodes: OutNode[], nodeIdentifier: number | string | N): OutNode | undefined {
    let foundNode: OutNode | undefined
    if (isNumber(nodeIdentifier)) foundNode = nodes[nodeIdentifier as number]
    else if (isString(nodeIdentifier)) foundNode = nodes.find(node => this.nodeId(node) === nodeIdentifier)
    else if (isObject(nodeIdentifier)) foundNode = nodes.find(node => node === nodeIdentifier)

    if (!foundNode) {
      console.warn(`Node ${nodeIdentifier} is missing from the nodes list`)
    }

    return foundNode
  }

  private transferState (
    items: (OutNode | OutLink)[],
    itemsPrev: (OutNode | OutLink)[],
    getId: ((d: unknown) => string)
  ): void {
    for (const item of items) {
      const dPrev = itemsPrev.find((dp: OutNode | OutLink) => getId(dp) === getId(item))
      if (dPrev) item._state = { ...dPrev._state }
      else item._state = {}
    }
  }
}
