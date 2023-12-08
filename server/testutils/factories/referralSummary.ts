import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import courseAudienceFactory from './courseAudience'
import FactoryHelpers from './factoryHelpers'
import { randomStatus } from './referral'
import { StringUtils } from '../../utils'
import type { ReferralSummary } from '@accredited-programmes/models'

export default Factory.define<ReferralSummary>(({ params }) => {
  const status = params.status || randomStatus()

  return {
    id: faker.string.uuid(), // eslint-disable-next-line sort-keys
    audiences: FactoryHelpers.buildListBetween(courseAudienceFactory, { max: 3, min: 1 }).map(
      audience => audience.value,
    ),
    courseName: `${StringUtils.convertToTitleCase(faker.color.human())} Course`,
    prisonNumber: faker.string.alphanumeric({ length: 7 }),
    status,
    submittedOn: status !== 'referral_started' ? faker.date.past().toISOString() : undefined,
  }
})
