// credit: https://github.com/solidjs-community/solid-primitives/tree/main/packages/trigger
/* eslint-disable solid/reactivity */

import type { SignalOptions } from 'solid-js'
import { createSignal, DEV } from 'solid-js'
import { isServer } from 'solid-js/web'

type Trigger = [track: VoidFunction, dirty: VoidFunction]
type Noop = (...a: unknown[]) => void

const triggerOptions: SignalOptions<unknown> =
  !isServer && DEV ? { equals: false, name: 'trigger' } : { equals: false }

const noop = (() => void 0) as Noop

export const createTrigger = (): Trigger => {
  if (isServer) {
    return [noop, noop]
  }
  return createSignal(undefined, triggerOptions)
}
