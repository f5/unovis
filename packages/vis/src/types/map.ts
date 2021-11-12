// Copyright (c) Volterra, Inc. All rights reserved.

export type MapLink<PointDatum, LinkDatum> = LinkDatum & {
  source: PointDatum;
  target: PointDatum;
}
