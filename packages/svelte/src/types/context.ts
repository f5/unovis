import type { ComponentCore } from '@unovis/ts/core/component'
import type { Tooltip } from '@unovis/ts/components/tooltip'
import type { Action } from 'svelte/action'

export type Lifecycle = Action<HTMLElement, ComponentCore<unknown> | Tooltip>
