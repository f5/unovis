import { createApp, Component } from 'vue'

export function mountVue (target: HTMLElement, component: Component): void {
  createApp(component).mount(target)
}
