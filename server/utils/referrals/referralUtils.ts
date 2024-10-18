import type { ReferralStatusCategory, ReferralStatusReason } from '@accredited-programmes-api'
import type { GovukFrontendFieldsetLegend, GovukFrontendRadiosItem } from '@govuk-frontend'

export default class ReferralUtils {
  static createReasonsFieldset(
    groupedOptions: Record<ReferralStatusCategory['referralStatusCode'], Array<ReferralStatusReason>>,
    selectedItemCode?: string,
  ): Array<{ legend: GovukFrontendFieldsetLegend; radios: Array<GovukFrontendRadiosItem>; testId: string }> {
    return Object.entries(groupedOptions).map(([categoryCode, reasons]) => {
      return {
        legend: {
          text: this.categoryCodeToText(categoryCode),
        },
        radios: ReferralUtils.statusOptionsToRadioItems(reasons, selectedItemCode),
        testId: `${categoryCode}-reason-options`,
      }
    })
  }

  static groupReasonsByCategory<T extends { code: string; description: string; referralCategoryCode: string }>(
    items: Array<T>,
  ): Record<string, Array<T>> {
    return items.reduce<Record<string, Array<T>>>((acc, item) => {
      if (!acc[item.referralCategoryCode]) {
        acc[item.referralCategoryCode] = []
      }

      acc[item.referralCategoryCode].push(item)

      return acc
    }, {})
  }

  static statusOptionsToRadioItems<T extends { code: string; description: string; hintText?: string }>(
    items: Array<T>,
    selectedItemCode?: string,
  ): Array<GovukFrontendRadiosItem> {
    return items.reduce<Array<GovukFrontendRadiosItem>>((acc, item) => {
      if (item.description === 'Other') {
        acc.push({ divider: 'or', value: '' })
      }

      acc.push({
        checked: selectedItemCode === item.code,
        ...(item.hintText
          ? {
              hint: {
                text: item.hintText,
              },
            }
          : {}),
        text: item.description,
        value: item.code,
      })

      return acc
    }, [])
  }

  private static categoryCodeToText(code: string): string {
    switch (code.split('_')[1]) {
      case 'ADMIN':
        return 'Administrative error'
      case 'MOTIVATION':
        return 'Motivation and behaviour'
      case 'OPERATIONAL':
        return 'Operational'
      case 'PERSONAL':
        return 'Personal and health'
      default:
        return code
    }
  }
}
