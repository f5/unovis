export const HOUR = 60 * 60 * 1000
export const DAY = 24 * HOUR

/** The week every chart shows, Monday to Monday, so the x axis doesn't change with the data */
export const WEEK_START = new Date(2025, 9, 6).getTime()
export const WEEK_END = new Date(2025, 9, 13).getTime()

/** Icons for the "Icons" preset, drawn in a -1…1 square (the unit box Vega-Lite expects for custom shapes) */
export const ICON_VIEW_BOX = '-1 -1 2 2'
/** A check mark in a circle, at the end of every deployment */
export const DEPLOYMENT_ICON_PATH = 'M0,-1A1,1 0 0 1 0,1A1,1 0 0 1 0,-1Z M-0.55,0L-0.15,0.4L0.55,-0.3L0.4,-0.45L-0.15,0.1L-0.4,-0.15Z'
/** A warning sign, at the start of every incident */
export const INCIDENT_ICON_PATH = 'M0,-1L1,0.85L-1,0.85Z M-0.1,-0.4L-0.1,0.25L0.1,0.25L0.1,-0.4Z M-0.1,0.4L-0.1,0.62L0.1,0.62L0.1,0.4Z'
/** Icon size in pixels */
export const ICON_SIZE = 16
