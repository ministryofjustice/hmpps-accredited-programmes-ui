import dateUtils from './dateUtils'
import stringUtils from './stringUtils'
import type { Person } from '@accredited-programmes/models'
import type { Prisoner } from '@prisoner-offender-search'

const personFromPrisoner = (prisoner: Prisoner): Person => {
  const unavailable = 'Not entered'

  return {
    name: stringUtils.convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
    prisonNumber: prisoner.prisonerNumber,
    currentPrison: prisoner.prisonName,
    dateOfBirth: dateUtils.govukFormattedFullDateString(prisoner.dateOfBirth),
    ethnicity: prisoner.ethnicity || unavailable,
    gender: prisoner.gender,
    religionOrBelief: prisoner.religion || unavailable,
    setting: 'Custody',
  }
}

export default { personFromPrisoner }
