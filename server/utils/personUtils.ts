import DateUtils from './dateUtils'
import StringUtils from './stringUtils'
import type { KeyDates, Person } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'
import type { PeopleSearchResponse } from '@accredited-programmes-api'
import type { GovukFrontendSummaryListRowKey } from '@govuk-frontend'

export const releaseDateFields = [
  'conditionalReleaseDate',
  'homeDetentionCurfewEligibilityDate',
  'paroleEligibilityDate',
  'sentenceExpiryDate',
  'tariffDate',
] as const

export default class PersonUtils {
  static personFromPrisoner(prisoner: PeopleSearchResponse): Person {
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
      prisonId: prisoner.prisonId,
      prisonNumber: prisoner.prisonerNumber,
      religionOrBelief: prisoner.religion,
      sentenceExpiryDate: prisoner.sentenceExpiryDate,
      sentenceStartDate: prisoner.sentenceStartDate,
      setting: 'Custody',
      tariffDate: prisoner.tariffDate,
    }
  }

  static releaseDatesSummaryListRows(keyDates?: Array<KeyDates>): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    if (!keyDates) {
      return []
    }

    const sortedKeyDates = keyDates.sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1

      return a.date.localeCompare(b.date)
    })

    return sortedKeyDates.map(keyDate => {
      const { date, description, earliestReleaseDate } = keyDate
      const key: GovukFrontendSummaryListRowKey = earliestReleaseDate
        ? {
            html: `${description}<br><span class="govuk-!-font-size-16 govuk-!-font-weight-regular release-dates__earliest-indicator">(Earliest release date)</span>`,
          }
        : { text: description }
      const value = date ? { text: DateUtils.govukFormattedFullDateString(date) } : { text: 'Unknown date' }
      return { key, value }
    })
  }

  static summaryListRows(person: Person): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    const age = DateUtils.calculateAge(person.dateOfBirth)

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
        value: {
          text: `${person.dateOfBirth} (${age.years} years, ${age.months} ${StringUtils.pluralise('month', age.months)})`,
        },
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
