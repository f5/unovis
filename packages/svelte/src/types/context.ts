import type { ComponentCore, Tooltip } from '@unovis/ts'
import type { Action } from 'svelte/action'

export type Lifecycle = Action<HTMLElement, ComponentCore<unknown> | Tooltip>
