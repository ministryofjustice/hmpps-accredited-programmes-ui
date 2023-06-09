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
      const organisationsWithOfferingIds = [
        { ...organisations[0], courseOfferingId: '33533e1f-96c2-48b8-b886-5c9d95c12ac0' },
        { ...organisations[1], courseOfferingId: 'c44588e6-fb5c-44bc-bf6a-9341e4a984df' },
        { ...organisations[2], courseOfferingId: '095b17e6-69d3-4e67-8cac-27b5cc1cb959' },
      ]

      expect(organisationTableRows(course, organisationsWithOfferingIds)).toEqual([
        [
          { text: organisations[0].name },
          { text: organisations[0].category },
          { text: organisations[0].address.county },
          {
            html: `<a href="/programmes/${course.id}/offerings/${organisationsWithOfferingIds[0].courseOfferingId}" class="govuk-link">Contact prison <span class="govuk-visually-hidden">(${organisationsWithOfferingIds[0].name})</span></a>`,
          },
        ],
        [
          { text: organisations[1].name },
          { text: organisations[1].category },
          { text: organisations[1].address.county },
          {
            html: `<a href="/programmes/${course.id}/offerings/${organisationsWithOfferingIds[1].courseOfferingId}" class="govuk-link">Contact prison <span class="govuk-visually-hidden">(${organisationsWithOfferingIds[1].name})</span></a>`,
          },
        ],
        [
          { text: organisations[2].name },
          { text: organisations[2].category },
          { text: organisations[2].address.county },
          {
            html: `<a href="/programmes/${course.id}/offerings/${organisationsWithOfferingIds[2].courseOfferingId}" class="govuk-link">Contact prison <span class="govuk-visually-hidden">(${organisationsWithOfferingIds[2].name})</span></a>`,
          },
        ],
      ])
    })
  })
})
