import { faker } from '@faker-js/faker/locale/en_GB'
import type { Factory } from 'fishery'

export default class FactoryHelpers {
  static buildListBetween<T>(factory: Factory<T>, options: { max: number; min?: number }): Array<T> {
    const quantity = Math.floor(Math.random() * options.max) + (options.min || 0)

    return factory.buildList(quantity)
  }

  static optionalArrayElement<T>(options: Array<T> | T): T | undefined {
    const fullOptions: Array<T | undefined> = [undefined]
    return faker.helpers.arrayElement(fullOptions.concat(options))
  }
}
