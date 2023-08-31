import ReferralUtils from './referralUtils'
import { referralFactory } from '../testutils/factories'

describe('ReferralUtils', () => {
  describe('taskListSections', () => {
    it('returns task list sections for a given referral', () => {
      const referral = referralFactory.build()

      expect(ReferralUtils.taskListSections(referral)).toEqual([
        {
          heading: 'Personal details',
          items: [
            {
              statusTag: { classes: 'govuk-tag moj-task-list__task-completed', text: 'completed' },
              text: 'Confirm personal details',
            },
          ],
        },
        {
          heading: 'Referral information',
          items: [
            {
              statusTag: { classes: 'govuk-tag govuk-tag--grey moj-task-list__task-completed', text: 'not started' },
              text: 'Add Accredited Programme history',
              url: '#',
            },
            {
              statusTag: { classes: 'govuk-tag govuk-tag--grey moj-task-list__task-completed', text: 'not started' },
              text: 'Confirm the OASys information',
              url: '#',
            },
            {
              statusTag: { classes: 'govuk-tag govuk-tag--grey moj-task-list__task-completed', text: 'not started' },
              text: 'Add reason for referral and any additional information',
              url: '#',
            },
          ],
        },
        {
          heading: 'Check answers and submit',
          items: [
            {
              statusTag: {
                classes: 'govuk-tag govuk-tag--grey moj-task-list__task-completed',
                text: 'cannot start yet',
              },
              text: 'Check answers and submit',
              url: '#',
            },
          ],
        },
      ])
    })
  })
})
