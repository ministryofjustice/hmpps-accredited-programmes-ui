import { faker } from '@faker-js/faker/locale/en_GB'
import type { BuildOptions, DeepPartial, Factory } from 'fishery'

export default class FactoryHelpers {
  static buildListBetween<T>(factory: Factory<T>, options: { max: number; min?: number }): Array<T> {
    const quantity = Math.floor(Math.random() * options.max) + (options.min || 0)

    return factory.buildList(quantity)
  }

  static buildListWith<T>(
    factory: Factory<T>,
    properties: DeepPartial<T>,
    options: BuildOptions<T, unknown>,
    count: number,
  ): Array<T> {
    const built: Array<T> = []

    while (built.length < count) {
      built.push(factory.build(properties, options))
    }

    return built
  }

  static randomFutureDateString(): string | undefined {
    return faker.date.future({ years: 20 }).toISOString().substring(0, 10)
  }
}
