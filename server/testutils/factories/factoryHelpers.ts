import type { Factory } from 'fishery'

export default class FactoryHelpers {
  static buildListBetween = <T>(factory: Factory<T>, options: { max: number; min?: number }): Array<T> => {
    const quantity = Math.floor(Math.random() * options.max) + (options.min || 0)

    return factory.buildList(quantity)
  }
}
