import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import courseAudienceFactory from './courseAudience'
import FactoryHelpers from './factoryHelpers'
import { randomStatus } from './referral'
import { StringUtils } from '../../utils'
import type { ReferralStatus, ReferralSummary } from '@accredited-programmes/models'

interface ReferralSummaryTransientParams {
  availableStatuses: Array<ReferralStatus>
}

export default Factory.define<ReferralSummary, ReferralSummaryTransientParams>(({ params, transientParams }) => {
  const { availableStatuses } = transientParams
  const status = params.status || randomStatus(availableStatuses)

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
