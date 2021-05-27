// Copyright (c) Volterra, Inc. All rights reserved.
export interface Particle {
  // Geographical properties
  source: { lat: number; lon: number };
  target: { lat: number; lon: number };
  location: { lat: number; lon: number };
  velocity: number;

  // Screen properties (passed to three.js renderer)
  x: number;
  y: number;
  r?: number;
  color?: string;
}

export interface LatLon {
  lat: number;
  lon: number;
}
