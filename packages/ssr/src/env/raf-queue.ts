/** Flushable requestAnimationFrame queue.
 *
 * Unovis defers rendering to the next animation frame (`ContainerCore.render`),
 * and several components schedule follow-up frames (axis, scatter, heatmap,
 * sankey, annotations, text-overlap). Instead of waiting on real timers we
 * queue callbacks and drain the queue synchronously until no new frames are
 * scheduled.
 */

type FrameCallback = (time: number) => void

export class RafQueue {
  private queue: { id: number; cb: FrameCallback }[] = []
  private nextId = 1
  /** Errors thrown by frame callbacks (collected so one bad frame can't kill a render) */
  public errors: unknown[] = []

  request = (cb: FrameCallback): number => {
    const id = this.nextId++
    this.queue.push({ id, cb })
    return id
  }

  cancel = (id: number): void => {
    const index = this.queue.findIndex(entry => entry.id === id)
    if (index >= 0) this.queue.splice(index, 1)
  }

  get size (): number {
    return this.queue.length
  }

  /** Drain the queue, letting callbacks schedule follow-up frames, until it
   * stays empty or the iteration cap is reached. Returns rounds executed. */
  flushAll (cap = 32): number {
    let rounds = 0
    while (this.queue.length && rounds < cap) {
      rounds += 1
      const batch = this.queue.splice(0, this.queue.length)
      const time = performance.now()
      for (const { cb } of batch) {
        try {
          cb(time)
        } catch (e) {
          this.errors.push(e)
        }
      }
    }
    return rounds
  }

  clear (): void {
    this.queue.length = 0
    this.errors.length = 0
  }
}
