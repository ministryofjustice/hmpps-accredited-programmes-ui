import { faker } from '@faker-js/faker/locale/en_GB'

import OrganisationUtils from './organisationUtils'
import {
  courseFactory,
  courseOfferingFactory,
  organisationAddressFactory,
  organisationFactory,
  prisonFactory,
} from '../testutils/factories'
import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'
import type { OrganisationWithOfferingId } from '@accredited-programmes/ui'

describe('OrganisationUtils', () => {
  describe('organisationFromPrison', () => {
    it('returns an organisation given an ID and a prison, sorting and joining its categories into a string', () => {
      const prison = prisonFactory.build({ categories: ['B', 'A'] })
      const { addressLine1, addressLine2, town, county, postcode, country } = prison.addresses[0]

      expect(OrganisationUtils.organisationFromPrison('an-ID', prison)).toEqual({
        id: 'an-ID', // eslint-disable-next-line sort-keys
        address: { addressLine1, addressLine2, country, county, postalCode: postcode, town },
        category: 'A/B',
        name: prison.prisonName,
      })
    })

    it('returns an empty string for the category if one cannot be found', () => {
      const prison = prisonFactory.build({ categories: [] })

      expect(OrganisationUtils.organisationFromPrison('an-ID', prison).category).toEqual('')
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

        expect(OrganisationUtils.organisationTableRows(course, organisationsWithOfferingIds)).toEqual([
          [
            { text: organisationsWithOfferingIds[0].name },
            { text: organisationsWithOfferingIds[0].category },
            { text: organisationsWithOfferingIds[0].address.county },
            {
              html: `<a class="govuk-link" href="/programmes/${course.id}/offerings/${organisationsWithOfferingIds[0].courseOfferingId}">Contact prison <span class="govuk-visually-hidden">(${organisationsWithOfferingIds[0].name})</span></a>`,
            },
          ],
          [
            { text: organisationsWithOfferingIds[1].name },
            { text: organisationsWithOfferingIds[1].category },
            { text: organisationsWithOfferingIds[1].address.county },
            {
              html: `<a class="govuk-link" href="/programmes/${course.id}/offerings/${organisationsWithOfferingIds[1].courseOfferingId}">Contact prison <span class="govuk-visually-hidden">(${organisationsWithOfferingIds[1].name})</span></a>`,
            },
          ],
          [
            { text: organisationsWithOfferingIds[2].name },
            { text: organisationsWithOfferingIds[2].category },
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

        expect(OrganisationUtils.organisationTableRows(course, [organisationWithOfferingId])).toEqual([
          [
            { text: organisationWithOfferingId.name },
            { text: organisationWithOfferingId.category },
            { text: 'Not found' },
            {
              html: `<a class="govuk-link" href="/programmes/${course.id}/offerings/${organisationWithOfferingId.courseOfferingId}">Contact prison <span class="govuk-visually-hidden">(${organisationWithOfferingId.name})</span></a>`,
            },
          ],
        ])
      })
    })
  })

  describe('presentOrganisationWithOfferingEmails', () => {
    let organisation: Organisation
    let offering: CourseOffering
    let course: Course

    beforeEach(() => {
      organisation = organisationFactory.build({
        address: organisationAddressFactory.build({
          addressLine1: '123 Alphabet Street',
          addressLine2: 'Thine District',
          county: 'Thisshire',
          postalCode: 'HE3 3TA',
          town: 'That Town Over There',
        }),
        category: 'C',
        name: 'What (HMP)',
      })

      offering = courseOfferingFactory.build({
        contactEmail: 'nobody-hmp-what@digital.justice.gov.uk',
        organisationId: organisation.id,
        secondaryContactEmail: 'nobody2-hmp-what@digital.justice.gov.uk',
      })

      course = courseFactory.build({ name: 'My course' })
    })

    describe('when all fields are present', () => {
      it("returns UI-formatted data about an organisation and an associated course offering's emails", () => {
        expect(OrganisationUtils.presentOrganisationWithOfferingEmails(organisation, offering, course.name)).toEqual({
          ...organisation,
          summaryListRows: [
            {
              key: { text: 'Prison category' },
              value: { text: 'C' },
            },
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
                html: '<a class="govuk-link" href="mailto:nobody-hmp-what@digital.justice.gov.uk?subject=Accredited%20programme%20referral%20-%20What%20(HMP)%20-%20My%20course">nobody-hmp-what@digital.justice.gov.uk</a>',
              },
            },
            {
              key: { text: 'Secondary email address' },
              value: {
                html: '<a class="govuk-link" href="mailto:nobody2-hmp-what@digital.justice.gov.uk?subject=Accredited%20programme%20referral%20-%20What%20(HMP)%20-%20My%20course">nobody2-hmp-what@digital.justice.gov.uk</a>',
              },
            },
          ],
        })
      })
    })

    describe('when the county/an address field is `null`', () => {
      it('filters the `null` fields from the address and returns `Not found` for the county', () => {
        organisation.address.county = null

        expect(OrganisationUtils.presentOrganisationWithOfferingEmails(organisation, offering, course.name)).toEqual({
          ...organisation,
          summaryListRows: [
            {
              key: { text: 'Prison category' },
              value: { text: 'C' },
            },
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
                html: '<a class="govuk-link" href="mailto:nobody-hmp-what@digital.justice.gov.uk?subject=Accredited%20programme%20referral%20-%20What%20(HMP)%20-%20My%20course">nobody-hmp-what@digital.justice.gov.uk</a>',
              },
            },
            {
              key: { text: 'Secondary email address' },
              value: {
                html: '<a class="govuk-link" href="mailto:nobody2-hmp-what@digital.justice.gov.uk?subject=Accredited%20programme%20referral%20-%20What%20(HMP)%20-%20My%20course">nobody2-hmp-what@digital.justice.gov.uk</a>',
              },
            },
          ],
        })
      })
    })

    describe('when the offering does not have a secondary contact email', () => {
      it('does not include a secondary email address field', () => {
        const offeringWithNoSecondaryContactEmail = courseOfferingFactory.build({
          contactEmail: 'nobody-hmp-what@digital.justice.gov.uk',
          secondaryContactEmail: null,
        })

        expect(
          OrganisationUtils.presentOrganisationWithOfferingEmails(
            organisation,
            offeringWithNoSecondaryContactEmail,
            course.name,
          ),
        ).toEqual({
          ...organisation,
          summaryListRows: [
            {
              key: { text: 'Prison category' },
              value: { text: 'C' },
            },
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
                html: '<a class="govuk-link" href="mailto:nobody-hmp-what@digital.justice.gov.uk?subject=Accredited%20programme%20referral%20-%20What%20(HMP)%20-%20My%20course">nobody-hmp-what@digital.justice.gov.uk</a>',
              },
            },
          ],
        })
      })
    })

    describe('when the organisation name includes an ampersand', () => {
      it('encodes the ampersand in the `mailto` link to keep it as one query parameter', () => {
        organisation.name = 'Wherefore (HMP & YOI)'

        expect(OrganisationUtils.presentOrganisationWithOfferingEmails(organisation, offering, course.name)).toEqual({
          ...organisation,
          summaryListRows: [
            {
              key: { text: 'Prison category' },
              value: { text: 'C' },
            },
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
                html: '<a class="govuk-link" href="mailto:nobody-hmp-what@digital.justice.gov.uk?subject=Accredited%20programme%20referral%20-%20Wherefore%20(HMP%20%26%20YOI)%20-%20My%20course">nobody-hmp-what@digital.justice.gov.uk</a>',
              },
            },
            {
              key: { text: 'Secondary email address' },
              value: {
                html: '<a class="govuk-link" href="mailto:nobody2-hmp-what@digital.justice.gov.uk?subject=Accredited%20programme%20referral%20-%20Wherefore%20(HMP%20%26%20YOI)%20-%20My%20course">nobody2-hmp-what@digital.justice.gov.uk</a>',
              },
            },
          ],
        })
      })
    })
  })
})
