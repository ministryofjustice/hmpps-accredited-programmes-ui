import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { Attitude } from '@accredited-programmes/api'

export default Factory.define<Attitude>(() => {
  return {
    motivationToAddressBehaviour: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    proCriminalAttitudes: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
  }
})
