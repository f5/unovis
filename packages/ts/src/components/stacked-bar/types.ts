export type StackedBarDataRecord<D> = D & {
  _index: number;
  _stacked: [number, number];
  _ending: boolean;
}
