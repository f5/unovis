// Types
import { TooltipContentMap } from './types'

export function getTooltipContentTargets (content?: TooltipContentMap<unknown>): (string | symbol)[] {
  return Reflect.ownKeys(content ?? {}).filter(target => content[target] !== undefined)
}
