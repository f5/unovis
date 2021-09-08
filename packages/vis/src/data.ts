// Copyright (c) Volterra, Inc. All rights reserved.
import worldMap from './data/world-simple.json'
import worldMap110mAlpha from './data/world-110m-alpha.json'

export const WorldMapTopoJSON = worldMap as unknown as TopoJSON.Topology<{countries: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const WorldMap110mAlphaTopoJSON = worldMap110mAlpha as unknown as TopoJSON.Topology<{countries: TopoJSON.GeometryCollection<{name: string; color: string}>}>
