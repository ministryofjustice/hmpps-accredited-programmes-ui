import PersonUtils from './personUtils'
import { personFactory, prisonerFactory } from '../testutils/factories'

describe('PersonUtils', () => {
  describe('personFromPrisoner', () => {
    describe('when all fields are present on a Prison Offender Search "Prisoner"', () => {
      it('returns a "Person" with those fields', () => {
        const prisoner = prisonerFactory.build({
          dateOfBirth: '1971-07-05',
          ethnicity: 'White',
          firstName: 'Del',
          gender: 'Male',
          lastName: 'Hatton',
          prisonName: 'HMP Hewell',
          prisonerNumber: 'ABC1234',
          religion: 'Christian',
        })

        expect(PersonUtils.personFromPrisoner(prisoner)).toEqual({
          currentPrison: 'HMP Hewell',
          dateOfBirth: '5 July 1971',
          ethnicity: 'White',
          gender: 'Male',
          name: 'Del Hatton',
          prisonNumber: 'ABC1234',
          religionOrBelief: 'Christian',
          setting: 'Custody',
        })
      })
    })

    describe('name', () => {
      it("formats the person's name in title case", () => {
        const prisoner = prisonerFactory.build({ firstName: 'DEL', lastName: 'HATTON' })

        expect(PersonUtils.personFromPrisoner(prisoner).name).toEqual('Del Hatton')
      })
    })

    describe('when fields are missing on a Prison Offender Search "Prisoner"', () => {
      it('returns a "Person" with those "Not entered" for those fields', () => {
        const prisoner = prisonerFactory.build({
          dateOfBirth: '1971-07-05',
          ethnicity: undefined,
          firstName: 'Del',
          gender: 'Male',
          lastName: 'Hatton',
          prisonName: 'HMP Hewell',
          prisonerNumber: 'ABC1234',
          religion: undefined,
        })

        expect(PersonUtils.personFromPrisoner(prisoner)).toEqual({
          currentPrison: 'HMP Hewell',
          dateOfBirth: '5 July 1971',
          ethnicity: 'Not entered',
          gender: 'Male',
          name: 'Del Hatton',
          prisonNumber: 'ABC1234',
          religionOrBelief: 'Not entered',
          setting: 'Custody',
        })
      })
    })
  })

  describe('summaryListRows', () => {
    it("formats a person's details in the appropriate format for passing to a GOV.UK Summary List nunjucks macro", () => {
      const person = personFactory.build({
        currentPrison: 'HMP Hewell',
        dateOfBirth: '5 July 1971',
        ethnicity: 'White',
        gender: 'Male',
        name: 'Del Hatton',
        prisonNumber: 'ABC1234',
        religionOrBelief: 'Christian',
        setting: 'Custody',
      })

      expect(PersonUtils.summaryListRows(person)).toEqual([
        {
          key: { text: 'Name' },
          value: { text: 'Del Hatton' },
        },
        {
          key: { text: 'Prison number' },
          value: { text: 'ABC1234' },
        },
        {
          key: { text: 'Date of birth' },
          value: { text: '5 July 1971' },
        },
        {
          key: { text: 'Ethnicity' },
          value: { text: 'White' },
        },
        {
          key: { text: 'Gender' },
          value: { text: 'Male' },
        },
        {
          key: { text: 'Religion or belief' },
          value: { text: 'Christian' },
        },
        {
          key: { text: 'Setting' },
          value: { text: 'Custody' },
        },
        {
          key: { text: 'Current prison' },
          value: { text: 'HMP Hewell' },
        },
      ])
    })
  })
})
