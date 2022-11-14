export class CoreDataModel<T> {
  protected _data: T | undefined

  get data (): T {
    return this._data
  }

  set data (value: T) {
    this._data = value
  }

  constructor (data?: T) {
    this.data = data
  }
}
