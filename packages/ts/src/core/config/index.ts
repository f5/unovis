import { isPlainObject, merge } from 'utils/data'

export class Config {
  init<T> (config: T): this {
    Object.keys(config).forEach(key => {
      if (isPlainObject(this[key]) && isPlainObject(config[key])) this[key] = merge(this[key], config[key])
      else this[key] = config[key]
    })

    return this
  }
}
