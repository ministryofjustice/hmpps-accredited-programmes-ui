import DateUtils from './dateUtils'
import StringUtils from './stringUtils'
import type { Person } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'
import type { GovukFrontendSummaryListRowKey } from '@govuk-frontend'
import type { Prisoner } from '@prisoner-search'

export const releaseDateFields = [
  'conditionalReleaseDate',
  'homeDetentionCurfewEligibilityDate',
  'paroleEligibilityDate',
  'sentenceExpiryDate',
  'tariffDate',
] as const

export default class PersonUtils {
  static personFromPrisoner(prisoner: Prisoner): Person {
    return {
      bookingId: prisoner.bookingId,
      conditionalReleaseDate: prisoner.conditionalReleaseDate,
      currentPrison: prisoner.prisonName,
      dateOfBirth: DateUtils.govukFormattedFullDateString(prisoner.dateOfBirth),
      ethnicity: prisoner.ethnicity,
      gender: prisoner.gender,
      homeDetentionCurfewEligibilityDate: prisoner.homeDetentionCurfewEligibilityDate,
      indeterminateSentence: prisoner.indeterminateSentence,
      name: StringUtils.convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
      paroleEligibilityDate: prisoner.paroleEligibilityDate,
      prisonNumber: prisoner.prisonerNumber,
      religionOrBelief: prisoner.religion,
      sentenceExpiryDate: prisoner.sentenceExpiryDate,
      sentenceStartDate: prisoner.sentenceStartDate,
      setting: 'Custody',
      tariffDate: prisoner.tariffDate,
    }
  }

  static releaseDatesSummaryListRows(person: Person): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    const summaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue> = []

    type ReleaseDateField = (typeof releaseDateFields)[number]

    let earliestReleaseDateField: Omit<ReleaseDateField, 'homeDetentionCurfewEligibilityDate' | 'sentenceExpiryDate'>

    if (person.indeterminateSentence) {
      earliestReleaseDateField = 'tariffDate'
    } else if (person.paroleEligibilityDate) {
      earliestReleaseDateField = 'paroleEligibilityDate'
    } else if (person.conditionalReleaseDate) {
      earliestReleaseDateField = 'conditionalReleaseDate'
    }

    const keyTextAndFields: Array<{ field: ReleaseDateField; keyText: GovukFrontendSummaryListRowKey['text'] }> = [
      { field: 'conditionalReleaseDate', keyText: 'Conditional release date' },
      { field: 'tariffDate', keyText: 'Tariff end date' },
      { field: 'sentenceExpiryDate', keyText: 'Sentence expiry date' },
      { field: 'paroleEligibilityDate', keyText: 'Parole eligibility date' },
      { field: 'homeDetentionCurfewEligibilityDate', keyText: 'Home detention curfew eligibility date' },
    ]

    keyTextAndFields.forEach(keyTextAndField => {
      const { field, keyText } = keyTextAndField
      let key: GovukFrontendSummaryListRowKey

      if (field === earliestReleaseDateField) {
        key = {
          html: `${keyText}<br><span class="govuk-!-font-size-16 govuk-!-font-weight-regular release-dates__earliest-indicator">(Earliest release date)</span>`,
        }
      } else {
        key = { text: keyText }
      }

      const valueText = person[field]
        ? DateUtils.govukFormattedFullDateString(person[field])
        : 'There is no record for this date'

      summaryListRows.push({
        key,
        value: { text: valueText },
      })
    })

    return summaryListRows
  }

  static summaryListRows(person: Person): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Name' },
        value: { text: person.name },
      },
      {
        key: { text: 'Prison number' },
        value: { text: person.prisonNumber },
      },
      {
        key: { text: 'Date of birth' },
        value: { text: person.dateOfBirth },
      },
      {
        key: { text: 'Ethnicity' },
        value: { text: person.ethnicity },
      },
      {
        key: { text: 'Gender' },
        value: { text: person.gender },
      },
      {
        key: { text: 'Religion or belief' },
        value: { text: person.religionOrBelief },
      },
      {
        key: { text: 'Setting' },
        value: { text: person.setting },
      },
      {
        key: { text: 'Current prison' },
        value: { text: person.currentPrison || 'Not entered' },
      },
    ]
  }
}
