import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { referralStatuses } from '../../@types/models/Referral'
import type { ReferralStatusCategory, ReferralStatusUppercase } from '@accredited-programmes/models'

export default Factory.define<ReferralStatusCategory>(() => {
  const code = faker.string.alpha({ casing: 'upper', length: 3 })

  return {
    code,
    description: `Category ${code} description`,
    referralStatusCode: faker.helpers.arrayElement(
      referralStatuses.map(status => status.toUpperCase()) as Array<ReferralStatusUppercase>,
    ),
  }
})
