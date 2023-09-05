import CourseUtils from './courseUtils'
import ReferralUtils from './referralUtils'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../testutils/factories'

describe('ReferralUtils', () => {
  describe('applicationSummaryListRows', () => {
    it('formats referral information in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      const course = courseFactory.build({
        alternateName: 'TC+',
        audiences: [
          {
            id: '1',
            value: 'General offence',
          },
        ],
        name: 'Test Course',
      })
      const courseOffering = courseOfferingFactory.build({ contactEmail: 'nobody-hmp-what@digital.justice.gov.uk' })
      const coursePresenter = CourseUtils.presentCourse(course)
      const organisation = organisationFactory.build({ name: 'HMP Hewell' })
      const person = personFactory.build({ name: 'Del Hatton' })
      const username = 'BOBBY_BROWN'

      expect(
        ReferralUtils.applicationSummaryListRows(courseOffering, coursePresenter, organisation, person, username),
      ).toEqual([
        {
          key: { text: 'Applicant name' },
          value: { text: 'Del Hatton' },
        },
        {
          key: { text: 'Programme name' },
          value: { text: 'Test Course (TC+)' },
        },
        {
          key: { text: 'Programme strand' },
          value: { text: 'General offence' },
        },
        {
          key: { text: 'Referrer name' },
          value: { text: 'BOBBY_BROWN' },
        },
        {
          key: { text: 'Referring prison' },
          value: { text: 'HMP Hewell' },
        },
        {
          key: { text: 'Contact email address' },
          value: { text: 'nobody-hmp-what@digital.justice.gov.uk' },
        },
      ])
    })
  })

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
              url: `/referrals/${referral.id}/oasys-confirmed`,
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
              url: `/referrals/${referral.id}/check-answers`,
            },
          ],
        },
      ])
    })
  })
})
