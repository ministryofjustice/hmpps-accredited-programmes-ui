import type { ReferralStatusCategory } from '@accredited-programmes/models'
import type { GovukFrontendRadiosItem } from '@govuk-frontend'

export default class ReferralUtils {
  static statusCategoriesToRadioItems(statusCategories: Array<ReferralStatusCategory>): Array<GovukFrontendRadiosItem> {
    return statusCategories.reduce<Array<GovukFrontendRadiosItem>>((acc, statusCategory) => {
      if (statusCategory.description === 'Other') {
        acc.push({ divider: 'or', value: '' })
      }

      acc.push({
        text: statusCategory.description,
        value: statusCategory.code,
      })

      return acc
    }, [])
  }
}
