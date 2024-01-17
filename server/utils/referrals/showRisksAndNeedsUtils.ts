import type { Request } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { Referral } from '@accredited-programmes/models'
import type { MojFrontendNavigationItem } from '@accredited-programmes/ui'

export default class ShowRisksAndNeedsUtils {
  static navigationItems(currentPath: Request['path'], referralId: Referral['id']): Array<MojFrontendNavigationItem> {
    const paths = currentPath.startsWith(assessPathBase.pattern) ? assessPaths : referPaths

    const navigationItems = [
      {
        href: paths.show.risksAndNeeds.offenceAnalysis({ referralId }),
        text: 'Section 2 - Offence analysis',
      },
      {
        href: paths.show.risksAndNeeds.roshAnalysis({ referralId }),
        text: 'Section R6 - ROSH analysis',
      },
    ]

    return navigationItems.map(item => ({
      ...item,
      active: currentPath === item.href,
    }))
  }

  static textValue(value?: string): string {
    return value || 'No information available'
  }

  static yesOrNo(value?: boolean): 'No' | 'Yes' {
    return value ? 'Yes' : 'No'
  }
}
