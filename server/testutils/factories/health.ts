import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { Health } from '@accredited-programmes/models'

export default Factory.define<Health>(({ params }) => {
  const anyHealthConditions =
    params.anyHealthConditions || FactoryHelpers.optionalArrayElement(faker.datatype.boolean())

  return {
    anyHealthConditions,
    description: anyHealthConditions ? FactoryHelpers.optionalArrayElement(faker.lorem.sentence()) : undefined,
  }
})
