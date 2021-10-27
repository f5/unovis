// Copyright (c) Volterra, Inc. All rights reserved.
import { ChordDiagramConfigInterface } from '@volterra/vis'
import { SingleVisStoryConfig } from '../../utils/single-content-wrapper'

export const baseConfig = (n = 25): SingleVisStoryConfig & ChordDiagramConfigInterface<unknown> => ({
  data: [],
})
