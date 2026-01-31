export type StackedBarDataRecord<D> = {
  datum: D;
  index: number;
  stacked: [number, number];
  stackIndex: number;
  isEnding: boolean;
}
