// Copyright (c) Volterra, Inc. All rights reserved.
import worldMap from './data/world-simple.json'
import worldMap110mAlpha from './data/world-110m-alpha.json'

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
// TopoJSON typings have troubles with being bundled so we're temporary disabling them
export const WorldMapTopoJSON = /* <TopoJSON.Topology><unknown> */worldMap
export const WorldMap110mAlphaTopoJSON = worldMap110mAlpha
