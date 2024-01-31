import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { Relationships } from '@accredited-programmes/api'

export default Factory.define<Relationships>(() => {
  return {
    dvEvidence: FactoryHelpers.optionalArrayElement(FactoryHelpers.optionalArrayElement(faker.datatype.boolean())),
    perpOfPartnerOrFamily: FactoryHelpers.optionalArrayElement(
      FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    ),
    relIssuesDetails: FactoryHelpers.optionalArrayElement(faker.lorem.paragraphs({ max: 3, min: 1 })),
    victimFamilyMember: FactoryHelpers.optionalArrayElement(
      FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    ),
    victimFormerPartner: FactoryHelpers.optionalArrayElement(
      FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    ),
    victimOfPartnerFamily: FactoryHelpers.optionalArrayElement(
      FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    ),
  }
})
