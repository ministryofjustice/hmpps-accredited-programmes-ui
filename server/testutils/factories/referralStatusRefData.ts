import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { statusDescriptionAndColour } from './referral'
import { referralStatuses } from '../../@types/models/Referral'
import type { ReferralStatusRefData, ReferralStatusUppercase } from '@accredited-programmes/models'
import type { TagColour } from '@accredited-programmes/ui'

export default Factory.define<ReferralStatusRefData>(() => {
  const code = faker.helpers.arrayElement(referralStatuses)
  const { statusColour: colour, statusDescription: description } = statusDescriptionAndColour(code)

  return {
    closed: faker.datatype.boolean(),
    code: code.toUpperCase() as ReferralStatusUppercase,
    colour: colour as TagColour,
    description: description as string,
    draft: faker.datatype.boolean(),
  }
})
