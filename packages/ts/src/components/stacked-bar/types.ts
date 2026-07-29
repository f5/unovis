export type StackedBarDataRecord<D> = {
  datum: D;
  index: number;
  stacked: [number, number];
  stackIndex: number;
  /** The segment tops off its stack, so its far edge is a free end */
  isEnding: boolean;
  /** No other segment of the group ends where this one begins, so its near edge is a free end */
  isStarting: boolean;
}
