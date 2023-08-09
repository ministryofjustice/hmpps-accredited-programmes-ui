import personUtils from './personUtils'
import { prisonerFactory } from '../testutils/factories'

describe('personUtils', () => {
  describe('personFromPrisoner', () => {
    describe('when all fields are present on a Prison Offender Search "Prisoner"', () => {
      it('returns a "Person" with those fields', () => {
        const prisoner = prisonerFactory.build({
          firstName: 'Del',
          lastName: 'Hatton',
          prisonerNumber: 'ABC1234',
          dateOfBirth: '1971-07-05',
          gender: 'Male',
          religion: 'Christian',
          ethnicity: 'White',
          prisonName: 'HMP Hewell',
        })

        expect(personUtils.personFromPrisoner(prisoner)).toEqual({
          name: 'Del Hatton',
          prisonNumber: 'ABC1234',
          dateOfBirth: '5 July 1971',
          ethnicity: 'White',
          gender: 'Male',
          religionOrBelief: 'Christian',
          setting: 'Custody',
          currentPrison: 'HMP Hewell',
        })
      })
    })

    describe('name', () => {
      it("formats the person's name in title case", () => {
        const prisoner = prisonerFactory.build({ firstName: 'DEL', lastName: 'HATTON' })

        expect(personUtils.personFromPrisoner(prisoner).name).toEqual('Del Hatton')
      })
    })

    describe('when fields are missing on a Prison Offender Search "Prisoner"', () => {
      it('returns a "Person" with those "Not entered" for those fields', () => {
        const prisoner = prisonerFactory.build({
          firstName: 'Del',
          lastName: 'Hatton',
          prisonerNumber: 'ABC1234',
          dateOfBirth: '1971-07-05',
          gender: 'Male',
          religion: undefined,
          ethnicity: undefined,
          prisonName: 'HMP Hewell',
        })

        expect(personUtils.personFromPrisoner(prisoner)).toEqual({
          name: 'Del Hatton',
          prisonNumber: 'ABC1234',
          dateOfBirth: '5 July 1971',
          ethnicity: 'Not entered',
          gender: 'Male',
          religionOrBelief: 'Not entered',
          setting: 'Custody',
          currentPrison: 'HMP Hewell',
        })
      })
    })
  })
})
