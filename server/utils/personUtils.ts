import DateUtils from './dateUtils'
import StringUtils from './stringUtils'
import type { Person } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithValue } from '@accredited-programmes/ui'
import type { Prisoner } from '@prisoner-search'

export default class PersonUtils {
  static personFromPrisoner(prisoner: Prisoner): Person {
    const unavailable = 'Not entered'
    let earliestReleaseDate: Person['earliestReleaseDate']

    if (prisoner.indeterminateSentence) {
      earliestReleaseDate = prisoner.tariffDate
    } else {
      earliestReleaseDate = prisoner.paroleEligibilityDate || prisoner.conditionalReleaseDate
    }

    return {
      bookingId: prisoner.bookingId,
      conditionalReleaseDate: prisoner.conditionalReleaseDate,
      currentPrison: prisoner.prisonName,
      dateOfBirth: DateUtils.govukFormattedFullDateString(prisoner.dateOfBirth),
      earliestReleaseDate,
      ethnicity: prisoner.ethnicity || unavailable,
      gender: prisoner.gender,
      homeDetentionCurfewEligibilityDate: prisoner.homeDetentionCurfewEligibilityDate,
      name: StringUtils.convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
      paroleEligibilityDate: prisoner.paroleEligibilityDate,
      prisonNumber: prisoner.prisonerNumber,
      religionOrBelief: prisoner.religion || unavailable,
      sentenceExpiryDate: prisoner.sentenceExpiryDate,
      sentenceStartDate: prisoner.sentenceStartDate,
      setting: 'Custody',
      tariffDate: prisoner.tariffDate,
    }
  }

  static summaryListRows(person: Person): Array<GovukFrontendSummaryListRowWithValue> {
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
        value: { text: person.currentPrison },
      },
    ]
  }
}
