// Copyright (c) Volterra, Inc. All rights reserved.
import {
  scaleLinear, scalePow, scaleSqrt, scaleLog, scaleIdentity, scaleTime, scaleUtc,
  scaleSequential, scaleDiverging, scaleQuantize, scaleQuantile, scaleThreshold, scaleOrdinal,
  scaleBand, scalePoint,
  ScaleLinear, ScalePower, ScaleLogarithmic, ScaleTime, /* ScaleOrdinal, ScaleBand, ScalePoint, ScaleThreshold, ScaleQuantile, ScaleQuantize, ScaleDiverging, ScaleSequential */
} from 'd3-scale'

export type ContiniousScale = ScaleLinear<number, any> | ScalePower<any, any> | ScaleLogarithmic<any, any> | ScaleTime<any, any>

export const Scale = {
  scaleLinear,
  scalePow,
  scaleSqrt,
  scaleLog,
  scaleIdentity,
  scaleTime,
  scaleUtc,
  scaleSequential,
  scaleDiverging,
  scaleQuantize,
  scaleQuantile,
  scaleThreshold,
  scaleOrdinal,
  scaleBand,
  scalePoint,
}
