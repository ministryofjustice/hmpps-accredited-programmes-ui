import CourseUtils from './courseUtils'
import FormUtils from './formUtils'
import ReferralUtils from './referralUtils'
import { assessPaths, referPaths } from '../paths'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
  referralSummaryFactory,
} from '../testutils/factories'
import type { ReferralStatus } from '@accredited-programmes/models'
import type { ReferralTaskListItem, ReferralTaskListSection } from '@accredited-programmes/ui'

jest.mock('./formUtils')

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

  describe('audienceSelectItems', () => {
    const expectedItems = {
      'extremism offence': 'Extremism offence',
      'gang offence': 'Gang offence',
      'general offence': 'General offence',
      'general violence offence': 'General violence offence',
      'intimate partner violence offence': 'Intimate partner violence offence',
      'sexual offence': 'Sexual offence',
    }

    it('makes a call to the `FormUtils.getSelectItems` method with an `undefined` `selectedValue` parameter', () => {
      ReferralUtils.audienceSelectItems()

      expect(FormUtils.getSelectItems).toHaveBeenCalledWith(expectedItems, undefined)
    })

    describe('when a selected value is provided', () => {
      it('makes a call to the `FormUtils.getSelectItems` method with the correct `selectedValue` parameter', () => {
        ReferralUtils.audienceSelectItems('general offence')

        expect(FormUtils.getSelectItems).toHaveBeenCalledWith(expectedItems, 'general offence')
      })
    })
  })

  describe('caseListTableRows', () => {
    it('formats referral summary information in the appropriate format for passing to a GOV.UK table Nunjucks macro', () => {
      const referralSummaries = [
        referralSummaryFactory.build({
          audiences: ['General offence'],
          courseName: 'Test Course 1',
          id: 'referral-123',
          prisonNumber: 'ABC1234',
          status: 'referral_started',
          submittedOn: undefined,
        }),
        referralSummaryFactory.build({
          audiences: ['General offence', 'Extremism offence'],
          courseName: 'Test Course 2',
          id: 'referral-456',
          prisonNumber: 'DEF1234',
          status: 'referral_submitted',
          submittedOn: new Date('2021-01-01T00:00:00.000000').toISOString(),
        }),
      ]

      expect(ReferralUtils.caseListTableRows(referralSummaries)).toEqual([
        [
          {
            attributes: { 'data-sort-value': 'ABC1234' },
            html: '<a class="govuk-link" href="/assess/referrals/referral-123/personal-details">ABC1234</a>',
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
          { text: 'Test Course 1' },
          {
            text: 'General offence',
          },
          {
            attributes: { 'data-sort-value': 'referral_started' },
            html: ReferralUtils.statusTagHtml('referral_started'),
          },
        ],
        [
          {
            attributes: { 'data-sort-value': 'DEF1234' },
            html: '<a class="govuk-link" href="/assess/referrals/referral-456/personal-details">DEF1234</a>',
          },
          {
            attributes: { 'data-sort-value': '2021-01-01T00:00:00.000Z' },
            text: '1 January 2021',
          },
          { text: 'Test Course 2' },
          {
            text: 'General offence, Extremism offence',
          },
          {
            attributes: { 'data-sort-value': 'referral_submitted' },
            html: ReferralUtils.statusTagHtml('referral_submitted'),
          },
        ],
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

  describe('statusSelectItems', () => {
    const expectedItems = {
      'assessment started': 'Assessment started',
      'awaiting assessment': 'Awaiting assessment',
      'referral started': 'Referral started',
      'referral submitted': 'Referral submitted',
    }

    it('makes a call to the `FormUtils.getSelectItems` method with an `undefined` `selectedValue` parameter', () => {
      ReferralUtils.statusSelectItems()

      expect(FormUtils.getSelectItems).toHaveBeenCalledWith(expectedItems, undefined)
    })

    describe('when a selected value is provided', () => {
      it('makes a call to the `FormUtils.getSelectItems` method with the correct `selectedValue` parameter', () => {
        ReferralUtils.statusSelectItems('referral submitted')

        expect(FormUtils.getSelectItems).toHaveBeenCalledWith(expectedItems, 'referral submitted')
      })
    })
  })

  describe('statusTagHtml', () => {
    it.each([
      ['assessment_started', 'yellow', 'Assessment started'],
      ['awaiting_assessment', 'orange', 'Awaiting assessment'],
      ['referral_submitted', 'red', 'Referral submitted'],
      ['referral_started', 'grey', 'referral_started'],
    ])(
      'should return the correct HTML for status "%s"',
      (status: string, expectedColour: string, expectedText: string) => {
        const result = ReferralUtils.statusTagHtml(status as ReferralStatus)

        expect(result).toBe(`<strong class="govuk-tag govuk-tag--${expectedColour}">${expectedText}</strong>`)
      },
    )
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

  describe('uiToApiAudienceQueryParam', () => {
    it('returns the UI query param formatted to match the API data', () => {
      expect(ReferralUtils.uiToApiAudienceQueryParam('general violence offence')).toEqual('General violence offence')
    })

    describe('when the param is falsey', () => {
      it('returns `undefined`', () => {
        expect(ReferralUtils.uiToApiAudienceQueryParam(undefined)).toEqual(undefined)
      })
    })
  })

  describe('uiToApiStatusQueryParam', () => {
    it('returns the UI query param formatted to match the API data', () => {
      expect(ReferralUtils.uiToApiStatusQueryParam('referral submitted')).toEqual('REFERRAL_SUBMITTED')
    })

    describe('when the param is falsey', () => {
      it('returns `undefined`', () => {
        expect(ReferralUtils.uiToApiStatusQueryParam(undefined)).toEqual(undefined)
      })
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
            href: referPaths.show.offenceHistory({ referralId: mockReferralId }),
            text: 'Offence history',
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
            href: assessPaths.show.offenceHistory({ referralId: mockReferralId }),
            text: 'Offence history',
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
