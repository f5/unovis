// Copyright (c) Volterra, Inc. All rights reserved.

export interface DataRecord {
  x: number;
  y: number;
  y1: number;
  y2: number;
  y3: number;
  baseline?: number;
}

export interface TimeDataRecord {
  timestamp: number;
  value: number;
}

export function generateDataRecords (n = 10): DataRecord[] {
  return Array(n).fill(0).map((_, i: number) => ({
    x: i,
    y: 5 + 5 * Math.random(),
    y1: 1 + 3 * Math.random(),
    y2: 2 * Math.random(),
    y3: -1 - 2 * Math.random(),
    y4: 3 * Math.random(),
    baseline: 2 * Math.random() - 0.5,
  }))
}

export function generateTimeSeries (n = 10): TimeDataRecord[] {
  return Array(n).fill(0).map((_, i: number) => ({
    timestamp: Date.now() + i * 1000 * 60 * 60 * 24,
    value: i / 10 + Math.sin(i / 5) + Math.cos(i / 3),
  }))
}
