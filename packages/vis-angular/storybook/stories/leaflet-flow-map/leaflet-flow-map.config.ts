// Copyright (c) Volterra, Inc. All rights reserved.
import { GraphConfigInterface } from '@volterra/vis'
import { SingleVisStoryConfig } from '../../utils/single-content-wrapper'

export const baseConfig = (n = 25): SingleVisStoryConfig & GraphConfigInterface<any, any> => ({
  data: [],
})
