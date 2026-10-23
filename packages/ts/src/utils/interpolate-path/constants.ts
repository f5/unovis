/* eslint-disable @typescript-eslint/naming-convention */
export const PATH_COMMAND_PARAMETERS = {
  M: ['x', 'y'],
  L: ['x', 'y'],
  C: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
  Q: ['x1', 'y1', 'x', 'y'],
  A: ['rx', 'ry', 'rotation', 'largeArc', 'sweep', 'x', 'y'],
  Z: [] as string[],
}

export const PATH_TOKEN_REGEX = /[A-Za-z]|[-+]?(?:\d*\.?\d+)(?:e[-+]?\d+)?/gi
