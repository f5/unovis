export type StackedBarDataRecord<D> = D & {
  _index: number;
  _stacked: [number, number];
  _stackIndex: number;
  _ending: boolean;
}
