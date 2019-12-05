// Copyright (c) Volterra, Inc. All rights reserved.
import _isUndefined from 'lodash/isUndefined'
import _cloneDeep from 'lodash/cloneDeep'
import _each from 'lodash/each'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _without from 'lodash/without'
import _find from 'lodash/find'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _isObject from 'lodash/isObject'

// Core
import { CoreDataModel } from './core'

export default class GraphDataModel extends CoreDataModel {
  private _nonConnectedNodes: object[]
  private _connectedNodes: object[]

  set data (inputData) {
    const prevData = this.data

    const { nodes, links } = _cloneDeep(inputData)

    // Every node or link can have a private state used for rendering needs
    // On data update we transfer state between objects with same ids
    this.transferState(nodes, prevData.nodes)
    this.transferState(links, prevData.links)

    // Set node index
    _each(nodes, (node, i) => {
      node._index = i
      node._id = node.id || i
    })

    // Fill link source and target
    _each(links, (link, i) => {
      link.source = this.findNode(link.source)
      link.target = this.findNode(link.target)
    })

    // Set link index for multiple link rendering
    _each(links, (link, i) => {
      if (!_isUndefined(link._index) && !_isUndefined(link._neighbours)) return

      const linksFiltered = _filter(links, l =>
        ((link.source === l.source) && (link.target === l.target)) ||
        ((link.source === l.target) && (link.target === l.source)),
      )

      _each(linksFiltered, (l, i) => {
        l._index = i
        l._id = l.id || `${_get(l, 'source._id')}-${_get(l, 'target._id')}-${i}`
        l._neighbours = linksFiltered.length
        l._direction = ((link.source === l.source) && (link.target === l.target)) ? 1 : -1
      })
    })

    // Determine if a node is connected or not and store it as a property
    _each(nodes, d => {
      d.links = _filter(links, l => (l.source === d) || (l.target === d))
      d._isConnected = d.links.length !== 0
    })

    this._nonConnectedNodes = _filter(nodes, d => !d._isConnected)
    this._connectedNodes = _without(nodes, ...this._nonConnectedNodes)
  }

  get nodes () {
    return this.data.nodes
  }

  get links () {
    return this.data.links
  }

  get connectedNodes () {
    return this._connectedNodes
  }

  get nonConnectedNodes () {
    return this._nonConnectedNodes
  }

  findNode (n) {
    if (_isNumber(n)) return this.nodes[n]
    else if (_isString(n)) return _find(this.nodes, node => node.id === n)
    else if (_isObject(n)) return _find(this.nodes, node => node === n)
    else {
      console.warn(`Node ${n} is missing from the nodes list`)
    }
  }

  transferState (arr, arrPrev): void {
    _each(arr, d => {
      const dPrev = _find(arrPrev, dp => dp.id === d.id)
      if (dPrev) d._state = { ...dPrev._state }
      else d._state = {}
    })
  }
}
