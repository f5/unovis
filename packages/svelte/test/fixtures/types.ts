import type { Line } from '@unovis/ts/components/line'
import type VisLine from '../../dist/components/line/line.svelte'
import type { Datum } from './state'

export function getCoreComponent (line: InstanceType<typeof VisLine<Datum>>): Line<Datum> {
  return line.getComponent()
}
