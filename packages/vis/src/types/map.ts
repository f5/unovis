export type MapLink<PointDatum, LinkDatum> = LinkDatum & {
  source: PointDatum;
  target: PointDatum;
}

