import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { ReferralStatusReason } from '@accredited-programmes-api'

export default Factory.define<ReferralStatusReason>(() => {
  const code = faker.string.alpha({ casing: 'upper', length: 3 }) as Uppercase<string>

  return {
    code,
    description: `Reason ${code} description`,
    referralCategoryCode: faker.string.alpha({ casing: 'upper', length: 3 }) as Uppercase<string>,
  }
})
