import type { Factory } from 'fishery'

const buildListBetween = <T>(factory: Factory<T>, options: { min?: number; max: number }): Array<T> => {
  const quantity = Math.floor(Math.random() * options.max) + (options.min || 0)

  return factory.buildList(quantity)
}

export default buildListBetween
