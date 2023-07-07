import { faker } from '@faker-js/faker/locale/en_GB'

import {
  organisationFromPrison,
  organisationTableRows,
  presentOrganisationWithOfferingEmail,
} from './organisationUtils'
import { courseFactory, organisationAddressFactory, organisationFactory, prisonFactory } from '../testutils/factories'
import type { OrganisationWithOfferingId } from '@accredited-programmes/ui'

describe('organisationUtils', () => {
  describe('organisationFromPrison', () => {
    it('returns an organisation given an ID and a prison', () => {
      const prison = prisonFactory.build()
      const { addressLine1, addressLine2, town, county, postcode, country } = prison.addresses[0]

      expect(organisationFromPrison('an-ID', prison)).toEqual({
        id: 'an-ID',
        name: prison.prisonName,
        category: 'N/A',
        address: { addressLine1, addressLine2, town, county, postalCode: postcode, country },
      })
    })
  })

  describe('organisationTableRows', () => {
    const course = courseFactory.build()
    let organisationsWithOfferingIds: Array<OrganisationWithOfferingId>

    beforeEach(() => {
      organisationsWithOfferingIds = [
        { ...organisationFactory.build(), courseOfferingId: '33533e1f-96c2-48b8-b886-5c9d95c12ac0' },
        { ...organisationFactory.build(), courseOfferingId: 'c44588e6-fb5c-44bc-bf6a-9341e4a984df' },
        { ...organisationFactory.build(), courseOfferingId: '095b17e6-69d3-4e67-8cac-27b5cc1cb959' },
      ]
    })

    describe('when the county is present', () => {
      it('returns organisation data formatted for `govukTable` rows', () => {
        organisationsWithOfferingIds.forEach((_organisation, organisationIndex) => {
          organisationsWithOfferingIds[organisationIndex].address.county = faker.location.county()
        })

        expect(organisationTableRows(course, organisationsWithOfferingIds)).toEqual([
          [
            { text: organisationsWithOfferingIds[0].name },
            { text: organisationsWithOfferingIds[0].address.county },
            {
              html: `<a class="govuk-link" href="/programmes/${course.id}/offerings/${organisationsWithOfferingIds[0].courseOfferingId}">Contact prison <span class="govuk-visually-hidden">(${organisationsWithOfferingIds[0].name})</span></a>`,
            },
          ],
          [
            { text: organisationsWithOfferingIds[1].name },
            { text: organisationsWithOfferingIds[1].address.county },
            {
              html: `<a class="govuk-link" href="/programmes/${course.id}/offerings/${organisationsWithOfferingIds[1].courseOfferingId}">Contact prison <span class="govuk-visually-hidden">(${organisationsWithOfferingIds[1].name})</span></a>`,
            },
          ],
          [
            { text: organisationsWithOfferingIds[2].name },
            { text: organisationsWithOfferingIds[2].address.county },
            {
              html: `<a class="govuk-link" href="/programmes/${course.id}/offerings/${organisationsWithOfferingIds[2].courseOfferingId}">Contact prison <span class="govuk-visually-hidden">(${organisationsWithOfferingIds[2].name})</span></a>`,
            },
          ],
        ])
      })
    })

    describe('when the county is `null`', () => {
      it('uses "Not found" in the county field', () => {
        const organisationWithOfferingId = organisationsWithOfferingIds[0]
        organisationWithOfferingId.address.county = null

        expect(organisationTableRows(course, [organisationWithOfferingId])).toEqual([
          [
            { text: organisationWithOfferingId.name },
            { text: 'Not found' },
            {
              html: `<a class="govuk-link" href="/programmes/${course.id}/offerings/${organisationWithOfferingId.courseOfferingId}">Contact prison <span class="govuk-visually-hidden">(${organisationWithOfferingId.name})</span></a>`,
            },
          ],
        ])
      })
    })
  })

  describe('presentOrganisationWithOfferingEmail', () => {
    const organisation = organisationFactory.build({
      name: 'HMP What',
      category: 'Category C',
      address: organisationAddressFactory.build({
        addressLine1: '123 Alphabet Street',
        addressLine2: 'Thine District',
        town: 'That Town Over There',
        county: 'Thisshire',
        postalCode: 'HE3 3TA',
      }),
    })

    const email = `nobody-hmp-what@digital.justice.gov.uk`

    describe('when all fields are present', () => {
      it('returns an organisation and course offering email with UI-formatted data', () => {
        expect(presentOrganisationWithOfferingEmail(organisation, email)).toEqual({
          ...organisation,
          summaryListRows: [
            {
              key: { text: 'Address' },
              value: { text: '123 Alphabet Street, Thine District, That Town Over There, Thisshire, HE3 3TA' },
            },
            {
              key: { text: 'County' },
              value: { text: 'Thisshire' },
            },
            {
              key: { text: 'Email address' },
              value: {
                html: '<a class="govuk-link" href="mailto:nobody-hmp-what@digital.justice.gov.uk">nobody-hmp-what@digital.justice.gov.uk</a>',
              },
            },
          ],
        })
      })
    })

    describe('when the county/an address field is `null`', () => {
      it('filters the `null` fields from the address and returns `Not found` for the county', () => {
        const organisationDuplicate = { ...organisation }
        organisationDuplicate.address.county = null

        expect(presentOrganisationWithOfferingEmail(organisationDuplicate, email)).toEqual({
          ...organisation,
          summaryListRows: [
            {
              key: { text: 'Address' },
              value: { text: '123 Alphabet Street, Thine District, That Town Over There, HE3 3TA' },
            },
            {
              key: { text: 'County' },
              value: { text: 'Not found' },
            },
            {
              key: { text: 'Email address' },
              value: {
                html: '<a class="govuk-link" href="mailto:nobody-hmp-what@digital.justice.gov.uk">nobody-hmp-what@digital.justice.gov.uk</a>',
              },
            },
          ],
        })
      })
    })
  })
})
