// A custom link curve type that routes links as right-angle steps with rounded corners,
// adapted from xyflow's smoothstep edge: https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/smoothstep-edge.ts
export const GRAPH_LINK_CURVE_SMOOTH_STEP = 'smoothStep'
export const GRAPH_LINK_SMOOTH_STEP_BORDER_RADIUS = 5
// Fixed gap a link always travels straight down from its source and straight down into its target,
// so the path still reads as source -> target even when the target ends up above the source
export const GRAPH_LINK_SMOOTH_STEP_OFFSET = 20
