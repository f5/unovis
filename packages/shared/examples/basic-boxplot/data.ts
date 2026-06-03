export type DataRecord = {
  x: number;
  median: number;
  quartiles: [number, number];
  whiskers: [number, number];
}

export const data: DataRecord[] = [
  { x: 0, median: 5.5, quartiles: [4.3, 7.0], whiskers: [2.0, 9.0] },
  { x: 1, median: 4.5, quartiles: [3.5, 6.5], whiskers: [1.5, 9.0] },
  { x: 2, median: 4.0, quartiles: [3.5, 8.0], whiskers: [3.0, 12.0] },
  { x: 3, median: 6.2, quartiles: [5.0, 7.8], whiskers: [3.2, 10.5] },
  { x: 4, median: 7.0, quartiles: [5.5, 8.5], whiskers: [3.5, 11.0] },
  { x: 5, median: 5.8, quartiles: [4.0, 7.2], whiskers: [1.0, 9.8] },
  { x: 6, median: 6.5, quartiles: [5.2, 8.8], whiskers: [3.8, 12.5] },
  { x: 7, median: 4.8, quartiles: [3.0, 6.0], whiskers: [1.2, 8.5] },
  { x: 8, median: 7.5, quartiles: [6.0, 9.2], whiskers: [4.0, 12.0] },
  { x: 9, median: 5.0, quartiles: [3.8, 6.8], whiskers: [2.2, 9.5] },
  { x: 10, median: 6.8, quartiles: [5.5, 8.2], whiskers: [3.0, 11.5] },
  { x: 11, median: 5.3, quartiles: [4.2, 7.5], whiskers: [2.5, 10.0] },
]
