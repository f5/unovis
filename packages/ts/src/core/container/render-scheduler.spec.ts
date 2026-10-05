import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Scheduler = typeof import('@/core/container/render-scheduler')

let now = 0
let frameCallbacks: (FrameRequestCallback | undefined)[] = []
let scheduler: Scheduler

/** Runs the frame callbacks that were pending when the frame started */
function runFrame (): void {
  const pending = frameCallbacks
  frameCallbacks = []
  pending.forEach(cb => cb?.(now))
}

/** Tasks that each spend `costMs` of the frame budget and record the order they ran in */
function createTasks (count: number, costMs: number): { tasks: (() => void)[]; order: number[] } {
  const order: number[] = []
  const tasks = Array.from({ length: count }, (_, i) => (): void => {
    now += costMs
    order.push(i)
  })
  return { tasks, order }
}

describe('Container render scheduler (jsdom)', () => {
  beforeEach(async () => {
    now = 0
    frameCallbacks = []

    vi.stubGlobal('performance', { now: () => now })
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frameCallbacks.push(cb))
    vi.stubGlobal('cancelAnimationFrame', (id: number) => { frameCallbacks[id - 1] = undefined })

    // Queue and budget live in module scope, so every test gets a fresh copy
    vi.resetModules()
    scheduler = await import('@/core/container/render-scheduler')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  /** The scheduler reports a failing render through `console.error` */
  function silenceRenderErrors (): void {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  }

  it('does not run a scheduled task synchronously', () => {
    const task = vi.fn()

    scheduler.scheduleContainerRender(task)

    expect(task).not.toHaveBeenCalled()
  })

  it('runs a single scheduled task in the next frame', () => {
    const task = vi.fn()
    scheduler.scheduleContainerRender(task)

    runFrame()

    expect(task).toHaveBeenCalledTimes(1)
  })

  it('runs a task scheduled twice before a flush only once, in its original position', () => {
    const { tasks, order } = createTasks(2, 0)
    scheduler.scheduleContainerRender(tasks[0])
    scheduler.scheduleContainerRender(tasks[1])

    scheduler.scheduleContainerRender(tasks[0])
    runFrame()

    expect(order).toEqual([0, 1])
  })

  it('does not run a cancelled task', () => {
    const cancelled = vi.fn()
    scheduler.scheduleContainerRender(cancelled)

    scheduler.cancelContainerRender(cancelled)
    runFrame()

    expect(cancelled).not.toHaveBeenCalled()
  })

  describe('when the queued tasks exceed the frame budget', () => {
    it('runs only the tasks that fit into the budget', () => {
      const { tasks, order } = createTasks(10, 3)
      tasks.forEach(task => scheduler.scheduleContainerRender(task))

      runFrame()

      expect(order).toEqual([0, 1, 2])
    })

    it('runs the rest in the following frames, in enqueue order', () => {
      const { tasks, order } = createTasks(10, 3)
      tasks.forEach(task => scheduler.scheduleContainerRender(task))

      runFrame()
      runFrame()
      runFrame()
      runFrame()

      expect(order).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('runs a task that busts the budget on its own rather than skipping it', () => {
      const { tasks, order } = createTasks(1, 20)
      tasks.forEach(task => scheduler.scheduleContainerRender(task))

      runFrame()

      expect(order).toEqual([0])
    })
  })

  it('runs the remaining tasks when one of them throws', () => {
    silenceRenderErrors()
    const failing = (): void => { throw new Error('render failed') }
    const next = vi.fn()
    scheduler.scheduleContainerRender(failing)
    scheduler.scheduleContainerRender(next)

    runFrame()

    expect(next).toHaveBeenCalledTimes(1)
  })

  it('keeps draining the queue after a task throws', () => {
    silenceRenderErrors()
    const { tasks, order } = createTasks(10, 3)
    scheduler.scheduleContainerRender(() => { throw new Error('render failed') })
    tasks.forEach(task => scheduler.scheduleContainerRender(task))

    runFrame()
    runFrame()
    runFrame()
    runFrame()

    expect(order).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('defers a task that re-schedules itself while rendering to the next frame', () => {
    const order: string[] = []
    const reentrant = (): void => {
      order.push('run')
      if (order.length === 1) scheduler.scheduleContainerRender(reentrant)
    }
    scheduler.scheduleContainerRender(reentrant)

    runFrame()

    expect(order).toEqual(['run'])
  })

  it('does not leave the re-scheduled task pending', () => {
    const order: string[] = []
    const reentrant = (): void => {
      order.push('run')
      if (order.length === 1) scheduler.scheduleContainerRender(reentrant)
    }
    scheduler.scheduleContainerRender(reentrant)

    runFrame()
    runFrame()

    expect(order).toEqual(['run', 'run'])
  })

  it('stops waiting on a frame that will never arrive after a reset', () => {
    const dropped = vi.fn()
    const afterReset = vi.fn()
    scheduler.scheduleContainerRender(dropped)

    // The SSR renderer throws away the frame queue between documents
    frameCallbacks = []
    scheduler.resetContainerRenderScheduler()
    scheduler.scheduleContainerRender(afterReset)
    runFrame()

    expect(afterReset).toHaveBeenCalledTimes(1)
  })

  describe('when the budget is `0`', () => {
    it('runs every pending task in a single frame', () => {
      const { tasks, order } = createTasks(10, 3)
      scheduler.setContainerRenderBudget(0)
      tasks.forEach(task => scheduler.scheduleContainerRender(task))

      runFrame()

      expect(order).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })
})
