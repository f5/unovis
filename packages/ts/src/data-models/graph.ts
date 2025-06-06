import { isNumber, isUndefined, cloneDeep, isFunction, without, isString, isObject, isEqual } from 'utils/data'

// Types
import { GraphInputLink, GraphInputNode, GraphLinkCore, GraphNodeCore } from 'types/graph'

// Core Data Model
import { CoreDataModel } from './core'

export type GraphData<N extends GraphInputNode, L extends GraphInputLink> = {
  nodes: N[];
  links?: L[];
}

export class GraphDataModel<
  N extends GraphInputNode,
  L extends GraphInputLink,
  OutNode extends GraphNodeCore<N, L> = GraphNodeCore<N, L>,
  OutLink extends GraphLinkCore<N, L> = GraphLinkCore<N, L>,
> extends CoreDataModel<GraphData<N, L>> {
  private _nonConnectedNodes: OutNode[]
  private _connectedNodes: OutNode[]
  private _nodes: OutNode[] = []
  private _links: OutLink[] = []
  private _inputNodesMap = new Map<OutNode, N>()
  private _nodesMap = new Map<string | number, OutNode>()

  // Model configuration
  public nodeId: ((n: N) => string | undefined) = n => (isString(n.id) || isFinite(n.id as number)) ? `${n.id}` : undefined
  public linkId: ((n: L) => string | undefined) = l => (isString(l.id) || isFinite(l.id as number)) ? `${l.id}` : undefined
  public nodeSort: ((a: N, b: N) => number)

  public getNodeById (id: string | number): OutNode {
    return this._nodesMap.get(id)
  }

  get data (): GraphData<N, L> {
    return this._data
  }

  set data (inputData: GraphData<N, L>) {
    if (!inputData) return
    this._data = inputData
    const prevNodes = this.nodes
    const prevLinks = this.links

    this._inputNodesMap.clear()
    this._nodesMap.clear()

    // Todo: Figure out why TypeScript complains about types
    const nodes = cloneDeep(inputData?.nodes ?? []) as undefined as OutNode[]
    const links = cloneDeep(inputData?.links ?? []) as undefined as OutLink[]

    // Every node or link can have a private state used for rendering needs
    // On data update we transfer state between objects with same ids
    this.transferState(nodes, prevNodes, this.nodeId)
    this.transferState(links, prevLinks, this.linkId)

    // Set node `_id` and `_index`
    nodes.forEach((node, i) => {
      node._index = i
      node._id = this.nodeId(node) || `${i}`
      this._inputNodesMap.set(node, inputData.nodes[i])
      this._nodesMap.set(node._id, node)
    })

    // Sort nodes
    if (isFunction(this.nodeSort)) nodes.sort(this.nodeSort)

    // Fill link source and target
    links.forEach((link, i) => {
      link._indexGlobal = i
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

    nodes.forEach(d => {
      // Determine if a node is connected or not and store it as a property
      d.links = links.filter(l => (l.source === d) || (l.target === d))
      d._isConnected = d.links.length !== 0
    })

    this._nonConnectedNodes = nodes.filter(d => !d._isConnected)
    this._connectedNodes = without(nodes, ...this._nonConnectedNodes)

    this._nodes = nodes

    this._links = links.filter(l => {
      if (l.source === l.target) {
        console.warn(`Unovis | Graph Data Model: Skipping link ${l._id} because it has the same source and target`)
        return false
      }

      return l.source && l.target
    })
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
    else if (isObject(nodeIdentifier)) foundNode = nodes.find(node => isEqual(this._inputNodesMap.get(node), nodeIdentifier))

    if (!foundNode) {
      console.warn(`Unovis | Graph Data Model: Node ${nodeIdentifier} is missing from the nodes list`)
    }

    return foundNode
  }

  private transferState<T extends { _state: Record<string, any>}> (
    items: T[],
    itemsPrev: T[],
    getId: (d: T) => string
  ): void {
    for (const item of items) {
      const dPrev = itemsPrev.find((dp) => getId(dp) === getId(item))
      if (dPrev) item._state = { ...dPrev._state }
      else item._state = {}
    }
  }

  public setNodeStateById (id: string, state: Record<string, any>): void {
    const node = this.getNodeById(id)
    if (!node) {
      console.warn(`Unovis | Graph Data Model: Node ${id} not found`)
      return
    }

    node._state = state
  }
}
