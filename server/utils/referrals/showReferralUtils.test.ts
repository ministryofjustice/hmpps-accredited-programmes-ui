import CaseListUtils from './caseListUtils'
import ShowReferralUtils from './showReferralUtils'
import { assessPaths, referPaths } from '../../paths'
import {
  courseFactory,
  organisationFactory,
  referralFactory,
  referralStatusHistoryFactory,
} from '../../testutils/factories'
import CourseUtils from '../courseUtils'
import type { ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'

jest.mock('./caseListUtils')

const mockCaseListUtils = CaseListUtils as jest.Mocked<typeof CaseListUtils>

describe('ShowReferralUtils', () => {
  describe('buttons', () => {
    describe('when on the assess journey', () => {
      it('contains the "Back to my referrals" button with the corect href', () => {
        expect(ShowReferralUtils.buttons(assessPaths.show.statusHistory({ referralId: 'mockReferralId' }))).toEqual([
          {
            href: '/assess/referrals/case-list',
            text: 'Back to my referrals',
          },
        ])
      })
    })

    describe('when on the refer journey', () => {
      it('contains the "Back to my referrals" button with the corect href', () => {
        expect(ShowReferralUtils.buttons(referPaths.show.statusHistory({ referralId: 'mockReferralId' }))).toEqual([
          {
            href: '/refer/referrals/case-list',
            text: 'Back to my referrals',
          },
        ])
      })
    })
  })

  describe('courseOfferingSummaryListRows', () => {
    it('formats course offering information in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      const course = courseFactory.build({
        alternateName: 'TC+',
        audience: 'General offence',
        name: 'Test Course',
      })
      const coursePresenter = CourseUtils.presentCourse(course)
      const organisation = organisationFactory.build({ name: 'HMP Hewell' })

      expect(ShowReferralUtils.courseOfferingSummaryListRows(coursePresenter, organisation.name)).toEqual([
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

  describe('statusHistoryTimelineItems', () => {
    const statusTagHtml = '<strong>Status tag</strong>'

    beforeEach(() => {
      mockCaseListUtils.statusTagHtml.mockReturnValue('<strong>Status tag</strong>')
    })

    it('returns referral status history in the appropriate format for passing to a MoJ Frontend timeline Nunjucks macro', () => {
      const startedReferralStatusHistory = referralStatusHistoryFactory.started().build()
      const submittedReferralStatusHistory = referralStatusHistoryFactory.submitted().build()
      const updatedReferralStatusHistory = referralStatusHistoryFactory.updated().build()

      const statusHistoryPresenter: Array<ReferralStatusHistoryPresenter> = [
        { ...updatedReferralStatusHistory, byLineText: 'You' },
        { ...submittedReferralStatusHistory, byLineText: 'Test User' },
        { ...startedReferralStatusHistory, byLineText: 'Test User' },
      ]

      expect(ShowReferralUtils.statusHistoryTimelineItems(statusHistoryPresenter)).toEqual([
        {
          byline: { text: 'You' },
          datetime: {
            timestamp: updatedReferralStatusHistory.statusStartDate,
            type: 'datetime',
          },
          html: expect.stringContaining(updatedReferralStatusHistory.notes as string),
          label: { text: 'Status update' },
        },
        {
          byline: { text: 'Test User' },
          datetime: {
            timestamp: submittedReferralStatusHistory.statusStartDate,
            type: 'datetime',
          },
          html: statusTagHtml,
          label: { text: 'Referral submitted' },
        },
        {
          byline: { text: 'Test User' },
          datetime: {
            timestamp: startedReferralStatusHistory.statusStartDate,
            type: 'datetime',
          },
          html: statusTagHtml,
          label: { text: 'Status update' },
        },
      ])
    })
  })

  describe('submissionSummaryListRows', () => {
    it('returns submission details relating to a referral in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      const referral = referralFactory.submitted().build({ submittedOn: '2023-10-31T00:00:00.000000' })

      expect(ShowReferralUtils.submissionSummaryListRows(referral.submittedOn, 'Test User')).toEqual([
        {
          key: { text: 'Date referred' },
          value: { text: '31 October 2023' },
        },
        {
          key: { text: 'Referrer name' },
          value: { text: 'Test User' },
        },
      ])
    })

    describe('when the referral has no submission date', () => {
      it("returns submission details with 'Not known' for the 'Date referred' value", () => {
        const referral = referralFactory.submitted().build({ submittedOn: undefined })

        expect(ShowReferralUtils.submissionSummaryListRows(referral.submittedOn, 'Test User')).toEqual(
          expect.arrayContaining([
            {
              key: { text: 'Date referred' },
              value: { text: 'Not known' },
            },
          ]),
        )
      })
    })
  })

  describe('subNavigationItems', () => {
    const mockReferralId = 'mock-referral-id'

    describe('when on the refer journey', () => {
      it('returns navigation items for the referral pages with the refer paths and sets the Status history link as active', () => {
        const currentRequestPath = referPaths.show.statusHistory({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'statusHistory', mockReferralId)).toEqual([
          {
            active: true,
            href: '/refer/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
        ])
      })

      it('returns navigation items for the referral pages with the refer paths and sets the Referral details link as active', () => {
        const currentRequestPath = referPaths.show.personalDetails({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'referral', mockReferralId)).toEqual([
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
          {
            active: true,
            href: '/refer/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
        ])
      })

      it('returns navigation items for the risks and needs pages with the refer paths and sets the Risks and needs link as active', () => {
        const currentRequestPath = referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'risksAndNeeds', mockReferralId)).toEqual([
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: true,
            href: '/refer/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
        ])
      })
    })

    describe('when on the assess journey', () => {
      it('returns navigation items for the referral pages with the refer paths and sets the Status history link as active', () => {
        const currentRequestPath = assessPaths.show.statusHistory({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'statusHistory', mockReferralId)).toEqual([
          {
            active: true,
            href: '/assess/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
        ])
      })

      it('returns navigation items for the referral pages with the assess paths and sets the Referral details link as active', () => {
        const currentRequestPath = assessPaths.show.personalDetails({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'referral', mockReferralId)).toEqual([
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
          {
            active: true,
            href: '/assess/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
        ])
      })

      it('returns navigation items for the risks and needs pages with the assess paths and sets the Risks and needs link as active', () => {
        const currentRequestPath = assessPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'risksAndNeeds', mockReferralId)).toEqual([
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: true,
            href: '/assess/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
        ])
      })
    })
  })

  describe('viewReferralNavigationItems', () => {
    const mockReferralId = 'mock-referral-id'

    describe('when viewing the referral on the refer journey', () => {
      it('returns navigation items for the view referral pages with the refer paths and sets the requested page as active', () => {
        const currentRequestPath = referPaths.show.personalDetails({ referralId: mockReferralId })

        expect(ShowReferralUtils.viewReferralNavigationItems(currentRequestPath, mockReferralId)).toEqual([
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

        expect(ShowReferralUtils.viewReferralNavigationItems(currentRequestPath, mockReferralId)).toEqual([
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
