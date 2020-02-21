// Copyright (c) Volterra, Inc. All rights reserved.
import {
  isNumber, isUndefined, cloneDeep,
  each, filter, without, find, isString, isObject,
} from 'utils/data'

// Core
import { CoreDataModel } from './core'

export class GraphDataModel<NodeDatum, LinkDatum> extends CoreDataModel<{nodes: NodeDatum[]; links?: LinkDatum[]}> {
  private _nonConnectedNodes: NodeDatum[]
  private _connectedNodes: NodeDatum[]
  private _nodes: NodeDatum[] = []
  private _links: LinkDatum[] = []

  set data (inputData: { nodes: NodeDatum[]; links?: LinkDatum[]}) {
    if (!inputData) return
    const prevData = this.data

    const nodes: NodeDatum[] = cloneDeep(inputData?.nodes ?? [])
    const links: LinkDatum[] = cloneDeep(inputData?.links ?? [])

    // Every node or link can have a private state used for rendering needs
    // On data update we transfer state between objects with same ids
    this.transferState(nodes, prevData?.nodes)
    this.transferState(links, prevData?.links)

    // Set node index
    each(nodes, (node, i) => {
      node._index = i
      node._id = node.id || i
    })

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
        l._id = l.id || `${l.source?._id}-${l.target?._id}-${i}`
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
    this._links = links
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

  findNode (nodes: NodeDatum[], n: number | string | object): NodeDatum {
    if (isNumber(n)) return nodes[n as number]
    else if (isString(n)) return find(nodes, node => node.id === n)
    else if (isObject(n)) return find(nodes, node => node === n)
    else {
      console.warn(`Node ${n} is missing from the nodes list`)
    }
  }

  transferState (arr, arrPrev): void {
    each(arr, d => {
      const dPrev = find(arrPrev, dp => dp.id === d.id)
      if (dPrev) d._state = { ...dPrev._state }
      else d._state = {}
    })
  }
}
