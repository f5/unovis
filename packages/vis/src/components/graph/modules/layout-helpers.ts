// Copyright (c) Volterra, Inc. All rights reserved.
// Types
import { NodeDatumCore } from 'types/graph'

export function positionNonConnectedNodes<N extends NodeDatumCore> (nodes: N[], y: number, spacing: number, width: number, xStart = 0): void {
  nodes.forEach((d, i) => {
    const x = spacing / 2 + i * spacing
    const rowIdx = width ? Math.floor(x / width) : 0
    d.y = (y + rowIdx * spacing) || 0
    d.x = width ? x % width + xStart : x + xStart
  })
}
