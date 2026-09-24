// Constants
import { DEFAULT_CONTAINER_RENDER_BUDGET_MS } from './constants'

// A queue shared by every container, so that a page full of charts spends a bounded amount of time
// rendering per frame instead of piling every render into one long task. `Set` gives de-duplication
// and insertion order for free.
const queue = new Set<() => void>()
let frameId: number | undefined
let frameBudgetMs = DEFAULT_CONTAINER_RENDER_BUDGET_MS

function flush (): void {
  frameId = undefined
  const frameStart = performance.now()

  // A copy, so a container that re-schedules itself mid-render waits for the next frame
  for (const task of [...queue]) {
    // `false` when an earlier task in this frame cancelled it
    if (!queue.delete(task)) continue

    try {
      task()
    } catch (error) {
      // One failing container mustn't stop the others
      console.error('Unovis | Container render failed', error)
    }

    // Checked after the task, so a lone container still renders in the next frame. `0` drains the queue
    if (frameBudgetMs > 0 && performance.now() - frameStart >= frameBudgetMs) break
  }

  if (queue.size && frameId === undefined) frameId = requestAnimationFrame(flush)
}

/** Schedules a render. Scheduling the same task twice before it runs renders it once */
export function scheduleContainerRender (task: () => void): void {
  queue.add(task)
  if (frameId === undefined) frameId = requestAnimationFrame(flush)
}

/** Removes a previously scheduled container render from the queue */
export function cancelContainerRender (task: () => void): void {
  queue.delete(task)
  if (!queue.size && frameId !== undefined) {
    cancelAnimationFrame(frameId)
    frameId = undefined
  }
}

/** Drops every pending render, for environments that reset the frame queue behind our back */
export function resetContainerRenderScheduler (): void {
  queue.clear()
  if (frameId !== undefined) {
    cancelAnimationFrame(frameId)
    frameId = undefined
  }
}

/** Milliseconds per frame that containers may spend rendering before yielding, so that many charts
 * drawing at once don't freeze the page. This spreads the work out rather than making it cheaper:
 * one very expensive chart still blocks its frame. Set to `0` to disable. Default: `8` */
export function setContainerRenderBudget (ms: number): void {
  frameBudgetMs = ms
}
