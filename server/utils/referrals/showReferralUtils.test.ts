import ShowReferralUtils from './showReferralUtils'
import { assessPaths, referPaths } from '../../paths'
import { courseFactory, organisationFactory, referralFactory } from '../../testutils/factories'
import CourseUtils from '../courseUtils'

describe('ShowReferralUtils', () => {
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
      it('returns navigation items for the referral pages with the refer paths and sets the Referral details link as active', () => {
        const currentRequestPath = referPaths.show.personalDetails({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'referral', mockReferralId)).toEqual([
          {
            active: true,
            href: '/refer/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/risks-and-needs/offence-analysis',
            text: 'Risks and needs',
          },
        ])
      })

      it('returns navigation items for the risks and needs pages with the refer paths and sets the Risks and needs link as active', () => {
        const currentRequestPath = referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'risksAndNeeds', mockReferralId)).toEqual([
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: true,
            href: '/refer/referrals/mock-referral-id/risks-and-needs/offence-analysis',
            text: 'Risks and needs',
          },
        ])
      })
    })

    describe('when on the assess journey', () => {
      it('returns navigation items for the referral pages with the assess paths and sets the Referral details link as active', () => {
        const currentRequestPath = assessPaths.show.personalDetails({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'referral', mockReferralId)).toEqual([
          {
            active: true,
            href: '/assess/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/risks-and-needs/offence-analysis',
            text: 'Risks and needs',
          },
        ])
      })

      it('returns navigation items for the risks and needs pages with the assess paths and sets the Risks and needs link as active', () => {
        const currentRequestPath = assessPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'risksAndNeeds', mockReferralId)).toEqual([
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: true,
            href: '/assess/referrals/mock-referral-id/risks-and-needs/offence-analysis',
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
