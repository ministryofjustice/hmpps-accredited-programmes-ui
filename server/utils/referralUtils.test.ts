import CourseUtils from './courseUtils'
import ReferralUtils from './referralUtils'
import { assessPaths, referPaths } from '../paths'
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

  describe('courseOfferingSummaryListRows', () => {
    it('formats course offering information in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
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
      const coursePresenter = CourseUtils.presentCourse(course)
      const organisation = organisationFactory.build({ name: 'HMP Hewell' })

      expect(ReferralUtils.courseOfferingSummaryListRows(coursePresenter, organisation.name)).toEqual([
        {
          key: { text: 'Programme name' },
          value: { text: 'Test Course (TC+)' },
        },
        {
          key: { text: 'Programme strand' },
          value: { text: 'General offence' },
        },
        {
          key: { text: 'Programme location' },
          value: { text: 'HMP Hewell' },
        },
      ])
    })
  })

  describe('isReadyForSubmission', () => {
    it('returns false for a new referral', () => {
      const newReferral = referralFactory.started().build()

      expect(ReferralUtils.isReadyForSubmission(newReferral)).toEqual(false)
    })

    it('returns false when programme history not reviewed', () => {
      const referral = referralFactory.submittable().build({ hasReviewedProgrammeHistory: false })

      expect(ReferralUtils.isReadyForSubmission(referral)).toEqual(false)
    })

    it('returns false when OASys not confirmed', () => {
      const referral = referralFactory.submittable().build({ oasysConfirmed: false })

      expect(ReferralUtils.isReadyForSubmission(referral)).toEqual(false)
    })

    it('returns false when additional information not provided', () => {
      const referral = referralFactory.submittable().build({ additionalInformation: '' })

      expect(ReferralUtils.isReadyForSubmission(referral)).toEqual(false)
    })

    it('returns true when programme history reviewed, OASys confirmed, and additional information provided', () => {
      const submittableReferral = referralFactory.submittable().build()

      expect(ReferralUtils.isReadyForSubmission(submittableReferral)).toEqual(true)
    })
  })

  describe('submissionSummaryListRows', () => {
    it('returns submission details relating to a referral in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      const referral = referralFactory.submitted().build({ submittedOn: '2023-10-31T00:00:00.000000' })

      expect(ReferralUtils.submissionSummaryListRows(referral)).toEqual([
        {
          key: { text: 'Date referred' },
          value: { text: '31 October 2023' },
        },
      ])
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
                text: 'not started',
              },
              text: 'Review Accredited Programme history',
              url: `/refer/referrals/new/${referral.id}/programme-history`,
            },
            {
              statusTag: {
                attributes: { 'data-testid': 'confirm-oasys-tag' },
                classes: 'govuk-tag--grey moj-task-list__task-completed',
                text: 'not started',
              },
              text: 'Confirm the OASys information',
              url: `/refer/referrals/new/${referral.id}/confirm-oasys`,
            },
            {
              statusTag: {
                attributes: { 'data-testid': 'additional-information-tag' },
                classes: 'govuk-tag--grey moj-task-list__task-completed',
                text: 'not started',
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
        text: 'completed',
      })
      expect(additionalInformationStatusTag).toEqual({
        attributes: { 'data-testid': 'additional-information-tag' },
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

      expect(checkAnswersTask.url).toEqual(`/refer/referrals/new/${referralWithOasysConfirmed.id}/check-answers`)
      expect(checkAnswersTask.statusTag.text).toEqual('not started')
    })
  })

  describe('viewReferralNavigationItems', () => {
    const mockReferralId = 'mock-referral-id'

    describe('when viewing the referral on the refer journey', () => {
      it('returns navigation items for the view referral pages with the refer paths and sets the requested page as active', () => {
        const currentRequestPath = referPaths.show.personalDetails({ referralId: mockReferralId })

        expect(ReferralUtils.viewReferralNavigationItems(currentRequestPath, mockReferralId)).toEqual([
          {
            active: true,
            href: referPaths.show.personalDetails({ referralId: mockReferralId }),
            text: 'Personal details',
          },
          {
            active: false,
            href: referPaths.show.programmeHistory({ referralId: mockReferralId }),
            text: 'Programme history',
          },
          {
            active: false,
            href: referPaths.show.sentenceInformation({ referralId: mockReferralId }),
            text: 'Sentence information',
          },
          {
            active: false,
            href: referPaths.show.additionalInformation({ referralId: mockReferralId }),
            text: 'Additional information',
          },
        ])
      })
    })

    describe('when viewing the referral on the assess journey', () => {
      it('returns navigation items for the view referral pages with the assess paths and sets the requested page as active', () => {
        const currentRequestPath = assessPaths.show.personalDetails({ referralId: mockReferralId })

        expect(ReferralUtils.viewReferralNavigationItems(currentRequestPath, mockReferralId)).toEqual([
          {
            active: true,
            href: assessPaths.show.personalDetails({ referralId: mockReferralId }),
            text: 'Personal details',
          },
          {
            active: false,
            href: assessPaths.show.programmeHistory({ referralId: mockReferralId }),
            text: 'Programme history',
          },
          {
            active: false,
            href: assessPaths.show.sentenceInformation({ referralId: mockReferralId }),
            text: 'Sentence information',
          },
          {
            active: false,
            href: assessPaths.show.additionalInformation({ referralId: mockReferralId }),
            text: 'Additional information',
          },
        ])
      })
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
