import CourseUtils from './courseUtils'
import ReferralUtils from './referralUtils'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../testutils/factories'
import type { ReferralTaskListItem, ReferralTaskListSection } from '@accredited-programmes/ui'

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

  describe('isReadyForSubmission', () => {
    it('returns false for a new referral', () => {
      const newReferral = referralFactory.started().build()

      expect(ReferralUtils.isReadyForSubmission(newReferral)).toEqual(false)
    })

    it('returns true when OASys is confirmed and a reason is provided', () => {
      // to be updated as the referral model is built out
      const submittableReferral = referralFactory.submittable().build()

      expect(ReferralUtils.isReadyForSubmission(submittableReferral)).toEqual(true)
    })
  })

  describe('taskListSections', () => {
    it('returns task list sections for a given referral', () => {
      const referral = referralFactory.started().build()

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
              url: `/referrals/${referral.id}/programme-history`,
            },
            {
              statusTag: {
                attributes: { 'data-testid': 'confirm-oasys-tag' },
                classes: 'govuk-tag--grey moj-task-list__task-completed',
                text: 'not started',
              },
              text: 'Confirm the OASys information',
              url: `/referrals/${referral.id}/confirm-oasys`,
            },
            {
              statusTag: {
                attributes: { 'data-testid': 'reason-tag' },
                classes: 'govuk-tag--grey moj-task-list__task-completed',
                text: 'not started',
              },
              text: 'Add reason for referral and any additional information',
              url: `/referrals/${referral.id}/reason`,
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
              testIds: { listItem: 'check-answers-list-item' },
              text: 'Check answers and submit',
              url: '',
            },
          ],
        },
      ])
    })

    it('marks completed sections as completed via their status tags', () => {
      const referralWithCompletedInformation = referralFactory.submittable().build()
      const taskListSections = ReferralUtils.taskListSections(referralWithCompletedInformation)
      const referralInformationSection = getTaskListSection('Referral information', taskListSections)
      const reasonStatusTag = getTaskListItem(
        'Add reason for referral and any additional information',
        referralInformationSection,
      ).statusTag
      const confirmOasysStatusTag = getTaskListItem(
        'Confirm the OASys information',
        referralInformationSection,
      ).statusTag

      expect(reasonStatusTag).toEqual({
        attributes: { 'data-testid': 'reason-tag' },
        classes: 'moj-task-list__task-completed',
        text: 'completed',
      })
      expect(confirmOasysStatusTag).toEqual({
        attributes: { 'data-testid': 'confirm-oasys-tag' },
        classes: 'moj-task-list__task-completed',
        text: 'completed',
      })
    })

    it('updates the check answers task when the referral is ready for submission', () => {
      const referralWithOasysConfirmed = referralFactory.submittable().build()
      const taskListSections = ReferralUtils.taskListSections(referralWithOasysConfirmed)
      const checkAnswersSection = getTaskListSection('Check answers and submit', taskListSections)
      const checkAnswersTask = getTaskListItem('Check answers and submit', checkAnswersSection)

      expect(checkAnswersTask.url).toEqual(`/referrals/${referralWithOasysConfirmed.id}/check-answers`)
      expect(checkAnswersTask.statusTag.text).toEqual('not started')
    })
  })
})

const getTaskListSection = (
  heading: string,
  taskListSections: Array<ReferralTaskListSection>,
): ReferralTaskListSection => {
  return taskListSections.find(section => section.heading === heading) as ReferralTaskListSection
}

const getTaskListItem = (text: string, section: ReferralTaskListSection): ReferralTaskListItem => {
  return section.items.find(item => item.text === text) as ReferralTaskListItem
}
