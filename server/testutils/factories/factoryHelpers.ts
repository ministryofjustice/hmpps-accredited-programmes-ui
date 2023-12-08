import { faker } from '@faker-js/faker/locale/en_GB'
import type { DeepPartial, Factory } from 'fishery'

export default class FactoryHelpers {
  static buildListBetween<T>(factory: Factory<T>, options: { max: number; min?: number }): Array<T> {
    const quantity = Math.floor(Math.random() * options.max) + (options.min || 0)

    return factory.buildList(quantity)
  }

  static buildListWith<T>(factory: Factory<T>, properties: DeepPartial<T>, count: number): Array<T> {
    const built: Array<T> = []

    while (built.length < count) {
      built.push(factory.build(properties))
    }

    return built
  }

  static optionalArrayElement<T>(options: Array<T> | T): T | undefined {
    const fullOptions: Array<T | undefined> = [undefined]
    return faker.helpers.arrayElement(fullOptions.concat(options))
  }

  static optionalRandomFutureDateString(): string | undefined {
    return FactoryHelpers.optionalArrayElement([`${faker.date.future({ years: 20 })}`.substring(0, 10)])
  }
}
