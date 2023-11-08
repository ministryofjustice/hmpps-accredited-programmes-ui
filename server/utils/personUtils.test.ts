import PersonUtils from './personUtils'
import { personFactory, prisonerFactory } from '../testutils/factories'
import type { Prisoner } from '@prisoner-search'

describe('PersonUtils', () => {
  describe('personFromPrisoner', () => {
    let prisoner: Prisoner

    beforeEach(() => {
      prisoner = prisonerFactory.build({
        bookingId: '1234567890',
        conditionalReleaseDate: '2024-10-31',
        dateOfBirth: '1971-07-05',
        ethnicity: 'White',
        firstName: 'Del',
        gender: 'Male',
        homeDetentionCurfewEligibilityDate: '2025-10-31',
        indeterminateSentence: false,
        lastName: 'Hatton',
        paroleEligibilityDate: '2026-10-31',
        prisonName: 'HMP Hewell',
        prisonerNumber: 'ABC1234',
        religion: 'Christian',
        sentenceExpiryDate: '2027-10-31',
        sentenceStartDate: '2010-10-31',
        tariffDate: '2028-10-31',
      })
    })

    describe('when all fields are present on a Prisoner Search "Prisoner"', () => {
      it('returns a "Person" with those fields', () => {
        expect(PersonUtils.personFromPrisoner(prisoner)).toEqual({
          bookingId: '1234567890',
          conditionalReleaseDate: '2024-10-31',
          currentPrison: 'HMP Hewell',
          dateOfBirth: '5 July 1971',
          ethnicity: 'White',
          gender: 'Male',
          homeDetentionCurfewEligibilityDate: '2025-10-31',
          indeterminateSentence: false,
          name: 'Del Hatton',
          paroleEligibilityDate: '2026-10-31',
          prisonNumber: 'ABC1234',
          religionOrBelief: 'Christian',
          sentenceExpiryDate: '2027-10-31',
          sentenceStartDate: '2010-10-31',
          setting: 'Custody',
          tariffDate: '2028-10-31',
        })
      })
    })

    describe('name', () => {
      it("formats the person's name in title case", () => {
        prisoner = { ...prisoner, firstName: 'DEL', lastName: 'HATTON' }

        expect(PersonUtils.personFromPrisoner(prisoner).name).toEqual('Del Hatton')
      })
    })

    describe('when fields are missing on a Prisoner Search "Prisoner"', () => {
      it('returns a "Person" with "Not entered" or `undefined` for those fields as appropriate', () => {
        prisoner = {
          ...prisoner,
          conditionalReleaseDate: undefined,
          ethnicity: undefined,
          homeDetentionCurfewEligibilityDate: undefined,
          indeterminateSentence: undefined,
          paroleEligibilityDate: undefined,
          religion: undefined,
          sentenceExpiryDate: undefined,
          sentenceStartDate: undefined,
          tariffDate: undefined,
        }

        expect(PersonUtils.personFromPrisoner(prisoner)).toEqual(
          expect.objectContaining({
            conditionalReleaseDate: undefined,
            ethnicity: 'Not entered',
            homeDetentionCurfewEligibilityDate: undefined,
            indeterminateSentence: undefined,
            paroleEligibilityDate: undefined,
            religionOrBelief: 'Not entered',
            sentenceExpiryDate: undefined,
            sentenceStartDate: undefined,
            tariffDate: undefined,
          }),
        )
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
