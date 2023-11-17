import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import courseAudienceFactory from './courseAudience'
import FactoryHelpers from './factoryHelpers'
import { status } from './referral'
import { StringUtils } from '../../utils'
import type { ReferralSummary } from '@accredited-programmes/models'

export default Factory.define<ReferralSummary>(({ params }) => ({
  id: faker.string.uuid(), // eslint-disable-next-line sort-keys
  audiences: FactoryHelpers.buildListBetween(courseAudienceFactory, { max: 3, min: 1 }),
  courseName: `${StringUtils.convertToTitleCase(faker.color.human())} Course`,
  prisonNumber: faker.string.alphanumeric({ length: 7 }),
  status,
  submittedOn: (params.status || status) !== 'referral_started' ? faker.date.past().toISOString() : undefined,
}))
