import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { ReferralSummaryTransientParams } from './referralSummary'
import referralSummaryFactory from './referralSummary'
import type { ReferralSummary } from '@accredited-programmes/api'
import type { ReferralSummaryWithTasksCompleted } from '@accredited-programmes/ui'

interface ReferralSummaryWithTasksCompletedTransientParams extends ReferralSummaryTransientParams {
  referralSummary?: ReferralSummary
}

class ReferralSummaryWithTasksCompletedFactory extends Factory<
  ReferralSummaryWithTasksCompleted,
  ReferralSummaryWithTasksCompletedTransientParams
> {
  withAllOptionalFields() {
    return this.transient({ requireOptionalFields: true })
  }
}

export default ReferralSummaryWithTasksCompletedFactory.define(({ params, transientParams }) => {
  const { availableStatuses, requireOptionalFields } = transientParams

  const referralSummary =
    transientParams.referralSummary ||
    referralSummaryFactory.build(params, { transient: { availableStatuses, requireOptionalFields } })

  return {
    ...referralSummary,
    tasksCompleted: faker.number.int({ max: 4, min: 1 }),
  }
})
