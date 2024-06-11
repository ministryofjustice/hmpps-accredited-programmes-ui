import type { Request } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { Referral } from '@accredited-programmes/models'
import type { MojFrontendNavigationItem } from '@accredited-programmes/ui'

export default class ShowRisksAndNeedsUtils {
  static navigationItems(currentPath: Request['path'], referralId: Referral['id']): Array<MojFrontendNavigationItem> {
    const paths = currentPath.startsWith(assessPathBase.pattern) ? assessPaths : referPaths

    const navigationItems = [
      {
        href: paths.show.risksAndNeeds.risksAndAlerts({ referralId }),
        text: 'Risks and alerts',
      },
      {
        href: paths.show.risksAndNeeds.offenceAnalysis({ referralId }),
        text: 'Section 2 - Offence analysis',
      },
      {
        href: paths.show.risksAndNeeds.relationships({ referralId }),
        text: 'Section 6 - Relationships',
      },
      {
        href: paths.show.risksAndNeeds.lifestyleAndAssociates({ referralId }),
        text: 'Section 7 - Lifestyle and associates',
      },
      {
        href: paths.show.risksAndNeeds.drugMisuse({ referralId }),
        text: 'Section 8 - Drug misuse',
      },
      {
        href: paths.show.risksAndNeeds.emotionalWellbeing({ referralId }),
        text: 'Section 10 - Emotional wellbeing',
      },
      {
        href: paths.show.risksAndNeeds.thinkingAndBehaving({ referralId }),
        text: 'Section 11 - Thinking and behaving',
      },
      {
        href: paths.show.risksAndNeeds.attitudes({ referralId }),
        text: 'Section 12 - Attitudes',
      },
      {
        href: paths.show.risksAndNeeds.health({ referralId }),
        text: 'Section 13 - Health',
      },
      {
        href: paths.show.risksAndNeeds.learningNeeds({ referralId }),
        text: 'Learning needs',
      },
      {
        href: paths.show.risksAndNeeds.roshAnalysis({ referralId }),
        text: 'Section R6 - RoSH analysis',
      },
    ]

    return navigationItems.map(item => ({
      ...item,
      active: currentPath === item.href,
    }))
  }

  static textValue(value?: string | null): string {
    return value || 'No information available'
  }

  static yesOrNo(value?: boolean): 'No' | 'Yes' {
    return value ? 'Yes' : 'No'
  }
}
