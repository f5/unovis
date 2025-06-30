export interface DataRecord {
  x: number;
  y: number;
  y1: number;
  y2: number;
}

export const data1: DataRecord[] = Array.from({ length: 20 }, (_, i) => ({
  x: i,
  y: Math.random() * 50 + 20,
  y1: Math.random() * 30 + 10,
  y2: Math.random() * 20 + 5,
}))

export const data2: DataRecord[] = Array.from({ length: 20 }, (_, i) => ({
  x: i,
  y: Math.random() * 100 + 50,
  y1: Math.random() * 60 + 30,
  y2: Math.random() * 40 + 20,
}))

export const data3: DataRecord[] = Array.from({ length: 20 }, (_, i) => ({
  x: i,
  y: Math.random() * 200 + 100,
  y1: Math.random() * 150 + 75,
  y2: Math.random() * 100 + 50,
}))
