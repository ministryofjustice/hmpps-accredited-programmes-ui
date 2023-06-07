import { organisationFromPrison, organisationTableRows } from './organisationUtils'
import { courseFactory, organisationFactory, prisonAddressFactory, prisonFactory } from '../testutils/factories'

describe('organisationUtils', () => {
  describe('organisationFromPrison', () => {
    it('returns an organisation given an ID and a prison', () => {
      const prison = prisonFactory.build({
        premise: 'HMP Cardiff',
        addresses: [
          prisonAddressFactory.build({
            street: 'Rabbit Avenue',
            town: 'Leporidaeville',
            locality: undefined,
            postalCode: 'LM19 0PH',
            primary: true,
          }),
          prisonAddressFactory.build({
            primary: false,
          }),
        ],
      })

      expect(organisationFromPrison('an-ID', prison)).toEqual({
        id: 'an-ID',
        name: prison.premise,
        category: 'N/A',
        address: {
          addressLine1: 'Rabbit Avenue',
          town: 'Leporidaeville',
          county: 'Not found',
          postalCode: 'LM19 0PH',
          country: 'United Kingdom',
        },
      })
    })
  })

  describe('organisationTableRows', () => {
    it('returns organisation data formatted for `govukTable` rows', () => {
      const course = courseFactory.build()
      const organisations = organisationFactory.buildList(3)

      expect(organisationTableRows(course, organisations)).toEqual([
        [
          { text: organisations[0].name },
          { text: organisations[0].category },
          { text: organisations[0].address.county },
          {
            html: `<a href="/programmes/${course.id}/prison/${organisations[0].id}" class="govuk-link">Contact prison <span class="govuk-visually-hidden">(${organisations[0].name})</span></a>`,
          },
        ],
        [
          { text: organisations[1].name },
          { text: organisations[1].category },
          { text: organisations[1].address.county },
          {
            html: `<a href="/programmes/${course.id}/prison/${organisations[1].id}" class="govuk-link">Contact prison <span class="govuk-visually-hidden">(${organisations[1].name})</span></a>`,
          },
        ],
        [
          { text: organisations[2].name },
          { text: organisations[2].category },
          { text: organisations[2].address.county },
          {
            html: `<a href="/programmes/${course.id}/prison/${organisations[2].id}" class="govuk-link">Contact prison <span class="govuk-visually-hidden">(${organisations[2].name})</span></a>`,
          },
        ],
      ])
    })
  })
})
