import ShowRisksAndNeedsUtils from './showRisksAndNeedsUtils'
import { assessPaths, referPaths } from '../../paths'

describe('ShowRisksAndNeedsUtils', () => {
  describe('htmlTextValue', () => {
    describe('when the value is undefined', () => {
      it('returns "No information available"', () => {
        expect(ShowRisksAndNeedsUtils.htmlTextValue(undefined)).toEqual('No information available')
      })
    })

    describe('when the value is an empty string', () => {
      it('returns "No information available"', () => {
        expect(ShowRisksAndNeedsUtils.htmlTextValue('')).toEqual('No information available')
      })
    })

    describe('when the value is a string', () => {
      it('returns the value with line breaks replaced by <br> tags', () => {
        expect(ShowRisksAndNeedsUtils.htmlTextValue('Mock string value\nwith line breaks')).toEqual(
          'Mock string value<br>with line breaks',
        )
      })
    })
  })

  describe('navigationItems', () => {
    const mockReferralId = 'mock-referral-id'

    describe('when viewing the risks and needs on the refer journey', () => {
      it('returns navigation items for the view referral pages with the refer paths and sets the requested page as active', () => {
        const currentRequestPath = referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })

        expect(ShowRisksAndNeedsUtils.navigationItems(currentRequestPath, mockReferralId)).toEqual([
          {
            active: false,
            href: `${referPaths.show.risksAndNeeds.risksAndAlerts({ referralId: mockReferralId })}#content`,
            text: 'Risks and alerts',
          },
          {
            active: false,
            href: `${referPaths.show.risksAndNeeds.learningNeeds({ referralId: mockReferralId })}#content`,
            text: 'Learning needs',
          },
          {
            active: true,
            href: `${referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })}#content`,
            text: 'Section 2 - Offence analysis',
          },
          {
            active: false,
            href: `${referPaths.show.risksAndNeeds.relationships({ referralId: mockReferralId })}#content`,
            text: 'Section 6 - Relationships',
          },
          {
            active: false,
            href: `${referPaths.show.risksAndNeeds.lifestyleAndAssociates({ referralId: mockReferralId })}#content`,
            text: 'Section 7 - Lifestyle and associates',
          },
          {
            active: false,
            href: `${referPaths.show.risksAndNeeds.drugMisuse({ referralId: mockReferralId })}#content`,
            text: 'Section 8 - Drug misuse',
          },
          {
            active: false,
            href: `${referPaths.show.risksAndNeeds.alcoholMisuse({ referralId: mockReferralId })}#content`,
            text: 'Section 9 - Alcohol misuse',
          },
          {
            active: false,
            href: `${referPaths.show.risksAndNeeds.emotionalWellbeing({ referralId: mockReferralId })}#content`,
            text: 'Section 10 - Emotional wellbeing',
          },
          {
            active: false,
            href: `${referPaths.show.risksAndNeeds.thinkingAndBehaving({ referralId: mockReferralId })}#content`,
            text: 'Section 11 - Thinking and behaving',
          },
          {
            active: false,
            href: `${referPaths.show.risksAndNeeds.attitudes({ referralId: mockReferralId })}#content`,
            text: 'Section 12 - Attitudes',
          },
          {
            active: false,
            href: `${referPaths.show.risksAndNeeds.health({ referralId: mockReferralId })}#content`,
            text: 'Section 13 - Health',
          },
          {
            active: false,
            href: `${referPaths.show.risksAndNeeds.roshAnalysis({ referralId: mockReferralId })}#content`,
            text: 'Section R6 - RoSH analysis',
          },
        ])
      })
    })

    describe('when viewing the risks and needs on the assess journey', () => {
      it('returns navigation items for the view risks and needs pages with the assess paths and sets the requested page as active', () => {
        const currentRequestPath = assessPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })

        expect(ShowRisksAndNeedsUtils.navigationItems(currentRequestPath, mockReferralId)).toEqual([
          {
            active: false,
            href: `${assessPaths.show.risksAndNeeds.risksAndAlerts({ referralId: mockReferralId })}#content`,
            text: 'Risks and alerts',
          },
          {
            active: false,
            href: `${assessPaths.show.risksAndNeeds.learningNeeds({ referralId: mockReferralId })}#content`,
            text: 'Learning needs',
          },
          {
            active: true,
            href: `${assessPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })}#content`,
            text: 'Section 2 - Offence analysis',
          },
          {
            active: false,
            href: `${assessPaths.show.risksAndNeeds.relationships({ referralId: mockReferralId })}#content`,
            text: 'Section 6 - Relationships',
          },
          {
            active: false,
            href: `${assessPaths.show.risksAndNeeds.lifestyleAndAssociates({ referralId: mockReferralId })}#content`,
            text: 'Section 7 - Lifestyle and associates',
          },
          {
            active: false,
            href: `${assessPaths.show.risksAndNeeds.drugMisuse({ referralId: mockReferralId })}#content`,
            text: 'Section 8 - Drug misuse',
          },
          {
            active: false,
            href: `${assessPaths.show.risksAndNeeds.alcoholMisuse({ referralId: mockReferralId })}#content`,
            text: 'Section 9 - Alcohol misuse',
          },
          {
            active: false,
            href: `${assessPaths.show.risksAndNeeds.emotionalWellbeing({ referralId: mockReferralId })}#content`,
            text: 'Section 10 - Emotional wellbeing',
          },
          {
            active: false,
            href: `${assessPaths.show.risksAndNeeds.thinkingAndBehaving({ referralId: mockReferralId })}#content`,
            text: 'Section 11 - Thinking and behaving',
          },
          {
            active: false,
            href: `${assessPaths.show.risksAndNeeds.attitudes({ referralId: mockReferralId })}#content`,
            text: 'Section 12 - Attitudes',
          },
          {
            active: false,
            href: `${assessPaths.show.risksAndNeeds.health({ referralId: mockReferralId })}#content`,
            text: 'Section 13 - Health',
          },
          {
            active: false,
            href: `${assessPaths.show.risksAndNeeds.roshAnalysis({ referralId: mockReferralId })}#content`,
            text: 'Section R6 - RoSH analysis',
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
