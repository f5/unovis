// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import {
  isNumber, isUndefined, cloneDeep, isFunction,
  each, filter, without, find, isString, isObject,
} from 'utils/data'

// Core
import { CoreDataModel } from './core'

export class GraphDataModel<NodeDatum, LinkDatum> extends CoreDataModel<{nodes: NodeDatum[]; links?: LinkDatum[]}> {
  private _nonConnectedNodes: NodeDatum[]
  private _connectedNodes: NodeDatum[]
  private _nodes: NodeDatum[] = []
  private _links: LinkDatum[] = []

  // Model configuration
  public nodeId: ((n: NodeDatum, i?: number) => string) = n => n['id']
  public linkId: ((n: LinkDatum, i?: number) => string) = l => l['id']
  public nodeSort: ((a: NodeDatum, b: NodeDatum) => number)

  // eslint-disable-next-line accessor-pairs
  set data (inputData: { nodes: NodeDatum[]; links?: LinkDatum[]}) {
    if (!inputData) return
    const prevData = this.data

    const nodes: NodeDatum[] = cloneDeep(inputData?.nodes ?? [])
    const links: LinkDatum[] = cloneDeep(inputData?.links ?? [])

    // Every node or link can have a private state used for rendering needs
    // On data update we transfer state between objects with same ids
    this.transferState(nodes, prevData?.nodes)
    this.transferState(links, prevData?.links)

    // Set node `_id` and `_index`
    each(nodes, (node, i) => {
      node._index = i
      node._id = this.nodeId(node) || `${i}`
    })

    // Sort nodes
    if (isFunction(this.nodeSort)) nodes.sort(this.nodeSort)

    // Fill link source and target
    each(links, (link, i) => {
      link.source = this.findNode(nodes, link.source)
      link.target = this.findNode(nodes, link.target)
    })

    // Set link index for multiple link rendering
    each(links, (link, i) => {
      if (!isUndefined(link._index) && !isUndefined(link._neighbours)) return

      const linksFiltered = filter(links, l =>
        ((link.source === l.source) && (link.target === l.target)) ||
        ((link.source === l.target) && (link.target === l.source))
      )

      each(linksFiltered, (l, i) => {
        l._index = i
        l._id = this.linkId(l) || `${l.source?._id}-${l.target?._id}-${i}`
        l._neighbours = linksFiltered.length
        l._direction = ((link.source === l.source) && (link.target === l.target)) ? 1 : -1
      })
    })

    // Determine if a node is connected or not and store it as a property
    each(nodes, d => {
      d.links = filter(links, l => (l.source === d) || (l.target === d))
      d._isConnected = d.links.length !== 0
    })

    this._nonConnectedNodes = filter(nodes, d => !d._isConnected)
    this._connectedNodes = without(nodes, ...this._nonConnectedNodes)

    this._nodes = nodes
    // eslint-disable-next-line dot-notation
    this._links = links.filter(l => l['source'] && l['target'])
  }

  get nodes (): NodeDatum[] {
    return this._nodes
  }

  get links (): LinkDatum[] {
    return this._links
  }

  get connectedNodes (): NodeDatum[] {
    return this._connectedNodes
  }

  get nonConnectedNodes (): NodeDatum[] {
    return this._nonConnectedNodes
  }

  private findNode (nodes: NodeDatum[], n: number | string | Record<string, unknown>): NodeDatum {
    let foundNode
    if (isNumber(n)) foundNode = nodes[n as number]
    else if (isString(n)) foundNode = find(nodes, node => this.nodeId(node) === n)
    else if (isObject(n)) foundNode = find(nodes, node => node === n)

    if (!foundNode) {
      console.warn(`Node ${n} is missing from the nodes list`)
    }

    return foundNode
  }

  private transferState (arr, arrPrev): void {
    each(arr, d => {
      const dPrev = find(arrPrev, dp => this.nodeId(dp) === this.nodeId(d))
      if (dPrev) d._state = { ...dPrev._state }
      else d._state = {}
    })
  }
}
