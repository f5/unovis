declare module 'svg-path-bounds' {
  /** Returns [left, top, right, bottom] bounds of an SVG path `d` string */
  export default function pathBounds (d: string): [number, number, number, number]
}
