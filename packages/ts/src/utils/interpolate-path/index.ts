import { PATH_COMMAND_PARAMETERS, PATH_TOKEN_REGEX } from './constants'

type CommandType = keyof typeof PATH_COMMAND_PARAMETERS
type Command = { type: CommandType; values: number[] }
type Subpath = { commands: Command[]; closed: boolean }

// Only absolute commands emitted by d3-shape and the chord link generator are needed.
function parsePath (path: string): Subpath[] {
  const tokens = (path || '').match(PATH_TOKEN_REGEX) || []
  const subpaths: Subpath[] = []
  for (let i = 0; i < tokens.length;) {
    const type = tokens[i++] as CommandType
    const count = PATH_COMMAND_PARAMETERS[type].length
    if (type === 'M') subpaths.push({ commands: [], closed: false })
    const subpath = subpaths[subpaths.length - 1]
    if (type === 'Z') subpath.closed = true
    else subpath.commands.push({ type, values: tokens.slice(i, i + count).map(Number) })
    i += count
  }
  return subpaths
}

function splitSegment (start: Command, end: Command, count: number): Command[] {
  if (count === 1) return [end]
  if (end.type === 'A') {
    return [...Array.from({ length: count - 1 }, () => ({ ...start, type: start.type === 'M' ? 'L' as const : start.type })), end]
  }

  const coordinates = [...start.values.slice(-2), ...end.values]
  let points = Array.from({ length: coordinates.length / 2 }, (_, i) => coordinates.slice(i * 2, i * 2 + 2))
  const commands: Command[] = []
  // Subdivide without changing the original line or Bézier curve.
  for (let remaining = count; remaining > 1; remaining--) {
    let level = points
    const left = [level[0]]
    const right = [level[level.length - 1]]
    while (level.length > 1) {
      level = level.slice(1).map((point, i) => point.map((value, j) => level[i][j] + (value - level[i][j]) / remaining))
      left.push(level[0])
      right.unshift(level[level.length - 1])
    }
    commands.push({ type: end.type, values: left.slice(1).flat() })
    points = right
  }
  commands.push({ type: end.type, values: points.slice(1).flat() })
  return commands
}

function extendCommands (commands: Command[], length: number): Command[] {
  if (commands.length === length) return commands
  if (commands.length === 1) {
    return [commands[0], ...Array.from({ length: length - 1 }, () => ({ type: 'L' as const, values: commands[0].values }))]
  }

  const counts = new Array<number>(commands.length - 1).fill(0)
  for (let i = 0; i < length - 1; i++) {
    counts[Math.floor(i * (commands.length - 1) / (length - 1))]++
  }
  return [commands[0], ...counts.flatMap((count, i) => splitSegment(commands[i], commands[i + 1], count))]
}

function convertCommand (source: Command, target: Command): number[] {
  if (source.type === target.type) return source.values
  const parameters = PATH_COMMAND_PARAMETERS[source.type]
  return PATH_COMMAND_PARAMETERS[target.type].map((parameter, i) => {
    const index = parameters.indexOf(parameter)
    if (index >= 0) return source.values[index]
    if (parameter[0] === 'x') return source.values[source.values.length - 2]
    if (parameter[0] === 'y') return source.values[source.values.length - 1]
    return i < 2 ? 0 : target.values[i]
  })
}

function interpolateSubpath (previous: Subpath, next: Subpath): (t: number) => string {
  const source = previous?.commands.length ? previous.commands : [next.commands[0]]
  const target = next?.commands.length ? next.commands : [source[0]]
  const length = Math.max(source.length, target.length)
  const a = extendCommands(source, length)
  const b = extendCommands(target, length)
  const values = a.map((command, i) => convertCommand(command, b[i]))
  const closed = (!previous || previous.closed) && (!next || next.closed)

  return (t: number): string => {
    let path = ''
    for (let i = 0; i < length; i++) {
      const command = b[i]
      const interpolated = command.values.map((value, j) => {
        const result = values[i][j] * (1 - t) + value * t
        return command.type === 'A' && (j === 3 || j === 4) ? Math.round(result) : result
      })
      path += command.type + interpolated.join(',')
    }
    return path + (closed ? 'Z' : '')
  }
}

export function interpolatePath (previous: string, next: string): (t: number) => string {
  if (previous === next) return (): string => next || ''
  const a = parsePath(previous)
  const b = parsePath(next)
  const interpolators = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => interpolateSubpath(a[i], b[i]))
  return (t: number): string => t === 1 ? next || '' : interpolators.map(interpolate => interpolate(t)).join('')
}
