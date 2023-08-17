import dateUtils from './dateUtils'
import stringUtils from './stringUtils'
import type { Person } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithValue } from '@accredited-programmes/ui'
import type { Prisoner } from '@prisoner-offender-search'

const personFromPrisoner = (prisoner: Prisoner): Person => {
  const unavailable = 'Not entered'

  return {
    currentPrison: prisoner.prisonName,
    dateOfBirth: dateUtils.govukFormattedFullDateString(prisoner.dateOfBirth),
    ethnicity: prisoner.ethnicity || unavailable,
    gender: prisoner.gender,
    name: stringUtils.convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
    prisonNumber: prisoner.prisonerNumber,
    religionOrBelief: prisoner.religion || unavailable,
    setting: 'Custody',
  }
}

const summaryListRows = (person: Person): Array<GovukFrontendSummaryListRowWithValue> => {
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

export default { personFromPrisoner, summaryListRows }
