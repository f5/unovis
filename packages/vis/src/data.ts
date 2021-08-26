// Copyright (c) Volterra, Inc. All rights reserved.
// eslint-disable-next-line import/no-unresolved
import { GeometryCollection, Topology } from 'topojson-specification'
import worldMap from './data/world-simple.json'
import worldMap110mAlpha from './data/world-110m-alpha.json'

export const WorldMapTopoJSON = worldMap as unknown as Topology<{countries: GeometryCollection<{name: string; color: string}>}>
export const WorldMap110mAlphaTopoJSON = worldMap110mAlpha as unknown as Topology<{countries: GeometryCollection<{name: string; color: string}>}>
