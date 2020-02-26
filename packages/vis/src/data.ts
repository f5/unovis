// Copyright (c) Volterra, Inc. All rights reserved.
import worldMap from './data/world-simple.json'

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
// TopoJSON typings have troubles with being bundled so we're temporary disabling them
const WorldMapTopoJSON = /* <TopoJSON.Topology><unknown> */worldMap
export { WorldMapTopoJSON }
