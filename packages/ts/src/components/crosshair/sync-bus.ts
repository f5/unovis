// Simple singleton event bus for crosshair sync by syncId

export type CrosshairSyncListener = (x: number | Date | undefined) => void

class CrosshairSyncBus {
  private listeners: Record<string, Set<CrosshairSyncListener>> = {}

  subscribe (syncId: string, listener: CrosshairSyncListener): void {
    if (!this.listeners[syncId]) {
      this.listeners[syncId] = new Set()
    }
    this.listeners[syncId].add(listener)
  }

  unsubscribe (syncId: string, listener: CrosshairSyncListener): void {
    this.listeners[syncId]?.delete(listener)
    if (this.listeners[syncId]?.size === 0) {
      delete this.listeners[syncId]
    }
  }

  emit (syncId: string, x: number | Date | undefined): void {
    this.listeners[syncId]?.forEach(listener => listener(x))
  }
}

export const crosshairSyncBus = new CrosshairSyncBus()
