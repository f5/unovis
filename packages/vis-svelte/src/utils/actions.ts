import type { ComponentCore, ComponentConfigInterface } from '@unovis/ts'

type Actions<Datum, ConfigInterface> = {
  setConfig: (e: HTMLElement, config: ComponentConfigInterface) => { update: (c: ConfigInterface) => void };
  setData: (e: HTMLElement, data: Datum) => { update: (d: Datum) => void };
}

export function getActions<Datum, ConfigInterface> (
  this: ComponentCore<Datum, any, ConfigInterface>
): Actions<Datum, ConfigInterface> {
  return {
    setConfig: (_: HTMLElement, config: ConfigInterface) => {
      this.setConfig(config)
      return {
        update: (config: ConfigInterface) => {
          this.setConfig(config)
          this.render()
        },
      }
    },
    setData: (_: HTMLElement, data: Datum) => {
      if (data) this.setData(data)
      return {
        update: (data: Datum) => {
          this.setData(data)
        },
      }
    },
  }
}
