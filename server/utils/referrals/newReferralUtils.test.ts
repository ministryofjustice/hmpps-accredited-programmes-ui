import NewReferralUtils from './newReferralUtils'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../../testutils/factories'
import CourseUtils from '../courseUtils'
import type { ReferralTaskListItem, ReferralTaskListSection } from '@accredited-programmes/ui'

describe('NewReferralUtils', () => {
  describe('courseOfferingSummaryListRows', () => {
    it('formats referral information in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      const course = courseFactory.build({
        alternateName: 'TC+',
        audience: 'General offence',
        name: 'Test Course',
      })
      const courseOffering = courseOfferingFactory.build({ contactEmail: 'nobody-hmp-what@digital.justice.gov.uk' })
      const coursePresenter = CourseUtils.presentCourse(course)
      const organisation = organisationFactory.build({ name: 'HMP Hewell' })
      const person = personFactory.build({ name: 'Del Hatton' })

      expect(
        NewReferralUtils.courseOfferingSummaryListRows(courseOffering, coursePresenter, organisation, person),
      ).toEqual([
        {
          key: { text: 'Applicant name' },
          value: { text: 'Del Hatton' },
        },
        {
          key: { text: 'Programme name' },
          value: { text: 'Test Course: general offence' },
        },
        {
          key: { text: 'Programme strand' },
          value: { text: 'General offence' },
        },
        {
          key: { text: 'Programme location' },
          value: { text: 'HMP Hewell' },
        },
        {
          key: { text: 'Programme team email address' },
          value: {
            html: '<a href="mailto:nobody-hmp-what@digital.justice.gov.uk">nobody-hmp-what@digital.justice.gov.uk</a>',
          },
        },
      ])
    })
  })

  describe('isReadyForSubmission', () => {
    it('returns false for a new referral', () => {
      const newReferral = referralFactory.started().build()

      expect(NewReferralUtils.isReadyForSubmission(newReferral)).toEqual(false)
    })

    it('returns false when programme history not reviewed', () => {
      const referral = referralFactory.submittable().build({ hasReviewedProgrammeHistory: false })

      expect(NewReferralUtils.isReadyForSubmission(referral)).toEqual(false)
    })

    it('returns false when OASys not confirmed', () => {
      const referral = referralFactory.submittable().build({ oasysConfirmed: false })

      expect(NewReferralUtils.isReadyForSubmission(referral)).toEqual(false)
    })

    it('returns false when additional information not provided', () => {
      const referral = referralFactory.submittable().build({ additionalInformation: '' })

      expect(NewReferralUtils.isReadyForSubmission(referral)).toEqual(false)
    })

    it('returns true when programme history reviewed, OASys confirmed, and additional information provided', () => {
      const submittableReferral = referralFactory.submittable().build()

      expect(NewReferralUtils.isReadyForSubmission(submittableReferral)).toEqual(true)
    })
  })

  describe('referrerSummaryListRows', () => {
    it('formats the referral referrer information in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      const referrerName = 'Bob Smith'
      const referrerEmail = 'bob.smith@test-email.co.uk'

      expect(NewReferralUtils.referrerSummaryListRows(referrerName, referrerEmail)).toEqual([
        {
          key: { text: 'Referrer name' },
          value: { text: referrerName },
        },
        {
          key: { text: 'Referrer email address' },
          value: { html: `<a href="mailto:${referrerEmail}">${referrerEmail}</a>` },
        },
      ])
    })
  })

  describe('taskListSections', () => {
    it('returns task list sections for a given referral', () => {
      const referral = referralFactory.started().build()

      expect(NewReferralUtils.taskListSections(referral)).toEqual([
        {
          heading: 'Personal details',
          items: [
            {
              statusTag: { classes: 'moj-task-list__task-completed', text: 'Completed' },
              text: 'Confirm personal details',
              url: `/refer/referrals/new/${referral.id}/person`,
            },
          ],
        },
        {
          heading: 'Referral information',
          items: [
            {
              statusTag: {
                attributes: { 'data-testid': 'programme-history-tag' },
                classes: 'govuk-tag--grey moj-task-list__task-completed',
                text: 'Not started',
              },
              text: 'Review Accredited Programme history',
              url: `/refer/referrals/new/${referral.id}/programme-history`,
            },
            {
              statusTag: {
                attributes: { 'data-testid': 'confirm-oasys-tag' },
                classes: 'govuk-tag--grey moj-task-list__task-completed',
                text: 'Not started',
              },
              text: 'Confirm the OASys information',
              url: `/refer/referrals/new/${referral.id}/confirm-oasys`,
            },
            {
              statusTag: {
                attributes: { 'data-testid': 'additional-information-tag' },
                classes: 'govuk-tag--grey moj-task-list__task-completed',
                text: 'Not started',
              },
              text: 'Add additional information',
              url: `/refer/referrals/new/${referral.id}/additional-information`,
            },
          ],
        },
        {
          heading: 'Check answers and submit',
          items: [
            {
              statusTag: {
                classes: 'govuk-tag--grey moj-task-list__task-completed',
                text: 'Cannot start yet',
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
      const taskListSections = NewReferralUtils.taskListSections(referralWithCompletedInformation)
      const referralInformationSection = getTaskListSection('Referral information', taskListSections)
      const accreditedProgrammeHistoryStatusTag = getTaskListItem(
        'Review Accredited Programme history',
        referralInformationSection,
      ).statusTag
      const additionalInformationStatusTag = getTaskListItem(
        'Add additional information',
        referralInformationSection,
      ).statusTag
      const confirmOasysStatusTag = getTaskListItem(
        'Confirm the OASys information',
        referralInformationSection,
      ).statusTag

      expect(accreditedProgrammeHistoryStatusTag).toEqual({
        attributes: { 'data-testid': 'programme-history-tag' },
        classes: 'moj-task-list__task-completed',
        text: 'Completed',
      })
      expect(additionalInformationStatusTag).toEqual({
        attributes: { 'data-testid': 'additional-information-tag' },
        classes: 'moj-task-list__task-completed',
        text: 'Completed',
      })
      expect(confirmOasysStatusTag).toEqual({
        attributes: { 'data-testid': 'confirm-oasys-tag' },
        classes: 'moj-task-list__task-completed',
        text: 'Completed',
      })
    })

    it('updates the check answers task when the referral is ready for submission', () => {
      const referralWithOasysConfirmed = referralFactory.submittable().build()
      const taskListSections = NewReferralUtils.taskListSections(referralWithOasysConfirmed)
      const checkAnswersSection = getTaskListSection('Check answers and submit', taskListSections)
      const checkAnswersTask = getTaskListItem('Check answers and submit', checkAnswersSection)

      expect(checkAnswersTask.url).toEqual(`/refer/referrals/new/${referralWithOasysConfirmed.id}/check-answers`)
      expect(checkAnswersTask.statusTag.text).toEqual('Not started')
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
