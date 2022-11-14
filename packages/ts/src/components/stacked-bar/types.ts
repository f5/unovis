export type StackedBarDataRecord<D> = D & {
  _stacked: [number, number];
  _negative: boolean;
  _ending: boolean;
}
