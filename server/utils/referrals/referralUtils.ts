import type { GovukFrontendRadiosItem } from '@govuk-frontend'

export default class ReferralUtils {
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
}
