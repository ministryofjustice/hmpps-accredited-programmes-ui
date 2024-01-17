import ShowRisksAndNeedsUtils from './showRisksAndNeedsUtils'
import { assessPaths, referPaths } from '../../paths'

describe('ShowRisksAndNeedsUtils', () => {
  describe('navigationItems', () => {
    const mockReferralId = 'mock-referral-id'

    describe('when viewing the risks and needs on the refer journey', () => {
      it('returns navigation items for the view referral pages with the refer paths and sets the requested page as active', () => {
        const currentRequestPath = referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })

        expect(ShowRisksAndNeedsUtils.navigationItems(currentRequestPath, mockReferralId)).toEqual([
          {
            active: true,
            href: referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId }),
            text: 'Section 2 - Offence analysis',
          },
          {
            active: false,
            href: referPaths.show.risksAndNeeds.roshAnalysis({ referralId: mockReferralId }),
            text: 'Section R6 - ROSH analysis',
          },
          {
            active: false,
            href: referPaths.show.risksAndNeeds.lifestyleAndAssociates({ referralId: mockReferralId }),
            text: 'Section 7 - Lifestyle and associates',
          },
        ])
      })
    })

    describe('when viewing the risks and needs on the assess journey', () => {
      it('returns navigation items for the view risks and needs pages with the assess paths and sets the requested page as active', () => {
        const currentRequestPath = assessPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })

        expect(ShowRisksAndNeedsUtils.navigationItems(currentRequestPath, mockReferralId)).toEqual([
          {
            active: true,
            href: assessPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId }),
            text: 'Section 2 - Offence analysis',
          },
          {
            active: false,
            href: assessPaths.show.risksAndNeeds.roshAnalysis({ referralId: mockReferralId }),
            text: 'Section R6 - ROSH analysis',
          },
          {
            active: false,
            href: assessPaths.show.risksAndNeeds.lifestyleAndAssociates({ referralId: mockReferralId }),
            text: 'Section 7 - Lifestyle and associates',
          },
        ])
      })
    })
  })

  describe('textValue', () => {
    describe('when the value is undefined', () => {
      it('returns "No information available"', () => {
        expect(ShowRisksAndNeedsUtils.textValue(undefined)).toEqual('No information available')
      })
    })

    describe('when the value is an empty string', () => {
      it('returns "No information available"', () => {
        expect(ShowRisksAndNeedsUtils.textValue('')).toEqual('No information available')
      })
    })

    describe('when the value is a string', () => {
      it('returns the value', () => {
        expect(ShowRisksAndNeedsUtils.textValue('Mock string value')).toEqual('Mock string value')
      })
    })
  })

  describe('yesOrNo', () => {
    describe('when the value is undefined', () => {
      it('returns "No"', () => {
        expect(ShowRisksAndNeedsUtils.yesOrNo(undefined)).toEqual('No')
      })
    })

    describe('when the value is false', () => {
      it('returns "No"', () => {
        expect(ShowRisksAndNeedsUtils.yesOrNo(false)).toEqual('No')
      })
    })

    describe('when the value is true', () => {
      it('returns "Yes"', () => {
        expect(ShowRisksAndNeedsUtils.yesOrNo(true)).toEqual('Yes')
      })
    })
  })
})
