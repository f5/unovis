// Copyright (c) Volterra, Inc. All rights reserved.
import { SankeyConfigInterface } from '@volterra/vis'
import { SingleVisStoryConfig } from '../../utils/single-content-wrapper'

// eslint-disable-next-line @typescript-eslint/ban-types
type SankeyNode = {}
type SankeyLink = {
  source: number;
  target: number;
}

export const baseConfig = (n = 25): SingleVisStoryConfig & SankeyConfigInterface<SankeyNode, SankeyLink> => ({
  data: { nodes: [], links: [] },
})
