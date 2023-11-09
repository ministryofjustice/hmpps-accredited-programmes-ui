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

  describe('releaseDatesSummaryListRows', () => {
    const personWithAllDatesAndDeterminateSentence = personFactory.build({
      conditionalReleaseDate: '2024-10-31',
      homeDetentionCurfewEligibilityDate: '2025-10-31',
      indeterminateSentence: false,
      paroleEligibilityDate: '2026-10-31',
      sentenceExpiryDate: '2027-10-31',
      tariffDate: '2028-10-31',
    })

    describe('when on an indeterminate sentence', () => {
      it('identifies tariff date as the earliest release date and formats release date information in the appropriate format for passing to a GOV.UK Summary List nunjucks macro', () => {
        const person = { ...personWithAllDatesAndDeterminateSentence, indeterminateSentence: true }

        expect(PersonUtils.releaseDatesSummaryListRows(person)).toEqual([
          {
            key: { text: 'Conditional release date' },
            value: { text: '31 October 2024' },
          },
          {
            key: {
              html: 'Tariff end date<br><span class="govuk-!-font-size-16 govuk-!-font-weight-regular release-dates__earliest-indicator">(Earliest release date)</span>',
            },
            value: { text: '31 October 2028' },
          },
          {
            key: { text: 'Sentence expiry date' },
            value: { text: '31 October 2027' },
          },
          {
            key: { text: 'Parole eligibility date' },
            value: { text: '31 October 2026' },
          },
          {
            key: { text: 'Home detention curfew eligibility date' },
            value: { text: '31 October 2025' },
          },
        ])
      })
    })

    describe('when on a determinate sentence', () => {
      describe('and with a parole eligibility date', () => {
        it('identifies parole eligibility date as the earliest release date and formats release date information in the appropriate format for passing to a GOV.UK Summary List nunjucks macro', () => {
          expect(PersonUtils.releaseDatesSummaryListRows(personWithAllDatesAndDeterminateSentence)).toEqual([
            {
              key: { text: 'Conditional release date' },
              value: { text: '31 October 2024' },
            },
            {
              key: { text: 'Tariff end date' },
              value: { text: '31 October 2028' },
            },
            {
              key: { text: 'Sentence expiry date' },
              value: { text: '31 October 2027' },
            },
            {
              key: {
                html: 'Parole eligibility date<br><span class="govuk-!-font-size-16 govuk-!-font-weight-regular release-dates__earliest-indicator">(Earliest release date)</span>',
              },
              value: { text: '31 October 2026' },
            },
            {
              key: { text: 'Home detention curfew eligibility date' },
              value: { text: '31 October 2025' },
            },
          ])
        })
      })

      describe('and without a parole eligibility date', () => {
        it('indicates that parole eligibility date is missing, identifies conditional release date as the earliest release date, and formats release date information in the appropriate format for passing to a GOV.UK Summary List nunjucks macro', () => {
          const person = { ...personWithAllDatesAndDeterminateSentence, paroleEligibilityDate: undefined }

          expect(PersonUtils.releaseDatesSummaryListRows(person)).toEqual([
            {
              key: {
                html: 'Conditional release date<br><span class="govuk-!-font-size-16 govuk-!-font-weight-regular release-dates__earliest-indicator">(Earliest release date)</span>',
              },
              value: { text: '31 October 2024' },
            },
            {
              key: { text: 'Tariff end date' },
              value: { text: '31 October 2028' },
            },
            {
              key: { text: 'Sentence expiry date' },
              value: { text: '31 October 2027' },
            },
            {
              key: { text: 'Parole eligibility date' },
              value: { text: 'There is no record for this date' },
            },
            {
              key: { text: 'Home detention curfew eligibility date' },
              value: { text: '31 October 2025' },
            },
          ])
        })
      })
    })

    describe('when dates are missing', () => {
      it('indicates that they are missing', () => {
        const person = {
          ...personWithAllDatesAndDeterminateSentence,
          conditionalReleaseDate: undefined,
          homeDetentionCurfewEligibilityDate: undefined,
          paroleEligibilityDate: undefined,
          sentenceExpiryDate: undefined,
          tariffDate: undefined,
        }

        expect(PersonUtils.releaseDatesSummaryListRows(person)).toEqual([
          {
            key: { text: 'Conditional release date' },
            value: { text: 'There is no record for this date' },
          },
          {
            key: { text: 'Tariff end date' },
            value: { text: 'There is no record for this date' },
          },
          {
            key: { text: 'Sentence expiry date' },
            value: { text: 'There is no record for this date' },
          },
          {
            key: { text: 'Parole eligibility date' },
            value: { text: 'There is no record for this date' },
          },
          {
            key: { text: 'Home detention curfew eligibility date' },
            value: { text: 'There is no record for this date' },
          },
        ])
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
