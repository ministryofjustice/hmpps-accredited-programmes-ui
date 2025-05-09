import type { SexualOffenceDetails } from '@accredited-programmes-api'
import type { GovukFrontendCheckboxesItem, GovukFrontendFieldsetLegend } from '@govuk-frontend'

export default class ReferenceDataUtils {
  static createSexualOffenceDetailsFieldset(
    groupedOptions: Record<string, Array<SexualOffenceDetails>>,
    selectedOptions: Array<string>,
  ): Array<{ checkboxes: Array<GovukFrontendCheckboxesItem>; legend: GovukFrontendFieldsetLegend }> {
    return Object.entries(groupedOptions).map(([categoryCode, options]) => ({
      checkboxes: this.sexualOffenceDetailsToCheckboxItems(options, selectedOptions),
      legend: {
        text: categoryCode,
      },
    }))
  }

  static groupOptionsByKey<T extends Record<K, number | string>, K extends keyof T>(
    items: Array<T>,
    field: K,
  ): Record<string, Array<T>> {
    return items.reduce<Record<string, Array<T>>>((acc, item) => {
      const key = item[field].toString()

      if (!acc[key]) {
        acc[key] = []
      }

      acc[key].push(item)

      return acc
    }, {})
  }

  private static sexualOffenceDetailsToCheckboxItems(
    options: Array<SexualOffenceDetails>,
    selectedOptions: Array<string>,
  ): Array<GovukFrontendCheckboxesItem> {
    return options.map(option => {
      const optionValue = `${option.id}::${option.score}`
      return {
        checked: selectedOptions.includes(optionValue),
        hint: {
          text: option.hintText,
        },
        text: option.description,
        value: optionValue,
      }
    })
  }
}
