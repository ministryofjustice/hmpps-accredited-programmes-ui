import CourseUtils from './courseUtils'
import ReferralUtils from './referralUtils'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../testutils/factories'
import type { ReferralTaskListSection } from '@accredited-programmes/ui'

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
              statusTag: { classes: 'moj-task-list__task-completed', text: 'completed' },
              text: 'Confirm personal details',
              url: `/referrals/${referral.id}/person`,
            },
          ],
        },
        {
          heading: 'Referral information',
          items: [
            {
              statusTag: { classes: 'govuk-tag--grey moj-task-list__task-completed', text: 'not started' },
              text: 'Add Accredited Programme history',
              url: '#',
            },
            {
              statusTag: {
                attributes: { 'data-testid': 'oasys-confirmed-tag' },
                classes: 'govuk-tag--grey moj-task-list__task-completed',
                text: 'not started',
              },
              text: 'Confirm the OASys information',
              url: `/referrals/${referral.id}/oasys-confirmed`,
            },
            {
              statusTag: { classes: 'govuk-tag--grey moj-task-list__task-completed', text: 'not started' },
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
                classes: 'govuk-tag--grey moj-task-list__task-completed',
                text: 'cannot start yet',
              },
              text: 'Check answers and submit',
              url: '',
            },
          ],
        },
      ])
    })

    it('marks completed sections as completed via their status tags', () => {
      const referralWithOasysConfirmed = referralFactory.build({ oasysConfirmed: true })
      const taskListSections = ReferralUtils.taskListSections(referralWithOasysConfirmed)
      const oasysConfirmedStatusTag = taskListSections[1].items[1].statusTag

      expect(oasysConfirmedStatusTag).toEqual({
        attributes: { 'data-testid': 'oasys-confirmed-tag' },
        classes: 'moj-task-list__task-completed',
        text: 'completed',
      })
    })

    it('updates the check answers task when the referral is ready for submission', () => {
      const referralWithOasysConfirmed = referralFactory.build({ oasysConfirmed: true })
      const taskListSections = ReferralUtils.taskListSections(referralWithOasysConfirmed)
      const checkAnswersTask = (
        taskListSections.find(section => section.heading === 'Check answers and submit') as ReferralTaskListSection
      ).items[0]

      expect(checkAnswersTask.url).toEqual(`/referrals/${referralWithOasysConfirmed.id}/check-answers`)
      expect(checkAnswersTask.statusTag.text).toEqual('not started')
    })
  })
})
