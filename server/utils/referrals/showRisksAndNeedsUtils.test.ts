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
        ])
      })
    })
  })
})
