import { isNumber, isUndefined, cloneDeep, isFunction, isString, isObject, isEqual } from '@/utils/data'

// Types
import { GraphInputLink, GraphInputNode, GraphLinkCore, GraphNodeCore } from '@/types/graph'

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
  private _nodesByUserId = new Map<string, OutNode>()
  private _nodesByInputRef = new Map<N, OutNode>()

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
    this._nodesByUserId.clear()
    this._nodesByInputRef.clear()

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
      this._nodesByInputRef.set(inputData.nodes[i], node)

      // Index nodes by their user-provided id for link endpoint resolution.
      // The first node wins on duplicate ids, matching lookup-by-scan behavior
      const userId = this.nodeId(node)
      if (userId !== undefined && !this._nodesByUserId.has(userId)) this._nodesByUserId.set(userId, node)
    })

    // Sort nodes
    if (isFunction(this.nodeSort)) nodes.sort(this.nodeSort)

    // Fill link source and target
    links.forEach((link, i) => {
      link._indexGlobal = i
      link.source = this.findNode(nodes, link.source)
      link.target = this.findNode(nodes, link.target)
    })

    // Group links connecting the same pair of nodes (in either direction) to set
    // their index for multiple link rendering. Nodes are keyed by `_index` because
    // it's unique per node object (unlike `_id`, which can collide on duplicate user ids)
    const linkGroups = new Map<string, OutLink[]>()
    for (const link of links) {
      const sourceIndex = (link.source as OutNode)?._index ?? -1
      const targetIndex = (link.target as OutNode)?._index ?? -1
      const key = sourceIndex <= targetIndex ? `${sourceIndex}|${targetIndex}` : `${targetIndex}|${sourceIndex}`
      const group = linkGroups.get(key)
      if (group) group.push(link)
      else linkGroups.set(key, [link])
    }

    linkGroups.forEach(group => {
      // Links that came in with `_index` and `_neighbours` already set keep their values,
      // but a single new link in the group triggers a reindex of the whole group
      if (group.every(l => !isUndefined(l._index) && !isUndefined(l._neighbours))) return

      const firstLink = group[0]
      group.forEach((l, i) => {
        l._index = i
        l._id = this.linkId(l) || `${l.source?._id}-${l.target?._id}-${i}`
        l._neighbours = group.length
        l._direction = ((firstLink.source === l.source) && (firstLink.target === l.target)) ? 1 : -1
      })
    })

    // Determine if a node is connected or not and store its links as a property
    const linksByNode = new Map<OutNode, OutLink[]>()
    nodes.forEach(node => linksByNode.set(node, []))
    for (const l of links) {
      if (l.source) linksByNode.get(l.source as OutNode)?.push(l)
      if (l.target && l.target !== l.source) linksByNode.get(l.target as OutNode)?.push(l)
    }

    nodes.forEach(d => {
      d.links = linksByNode.get(d)
      d._isConnected = d.links.length !== 0
    })

    this._nonConnectedNodes = nodes.filter(d => !d._isConnected)
    this._connectedNodes = nodes.filter(d => d._isConnected)

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
    else if (isString(nodeIdentifier)) foundNode = this._nodesByUserId.get(nodeIdentifier as string)
    else if (isObject(nodeIdentifier)) {
      // Fast path: the identifier is the same object as one of the input nodes.
      // Fall back to a deep-equality scan for value-equal but not identical objects
      foundNode = this._nodesByInputRef.get(nodeIdentifier as N) ??
        nodes.find(node => isEqual(this._inputNodesMap.get(node), nodeIdentifier))
    }

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
    // The first item wins on duplicate ids, matching lookup-by-scan behavior
    const prevById = new Map<string, T>()
    for (const dPrev of itemsPrev) {
      const id = getId(dPrev)
      if (!prevById.has(id)) prevById.set(id, dPrev)
    }

    for (const item of items) {
      const dPrev = prevById.get(getId(item))
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
