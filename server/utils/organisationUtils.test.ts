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
import type { EnabledOrganisation } from '@accredited-programmes-api'

describe('OrganisationUtils', () => {
  describe('organisationFromPrison', () => {
    it('returns an organisation given an ID and a prison, sorting and joining its categories into a string', () => {
      const prison = prisonFactory.build({ categories: ['B', 'A'], prisonId: 'an-ID' })
      const { addressLine1, addressLine2, town, county, postcode, country } = prison.addresses[0]

      expect(OrganisationUtils.organisationFromPrison(prison)).toEqual({
        id: 'an-ID', // eslint-disable-next-line sort-keys
        address: { addressLine1, addressLine2, country, county, postalCode: postcode, town },
        category: 'A/B',
        name: prison.prisonName,
      })
    })

    it('returns an empty string for the category if one cannot be found', () => {
      const prison = prisonFactory.build({ categories: [] })

      expect(OrganisationUtils.organisationFromPrison(prison).category).toEqual('')
    })
  })

  describe('organisationRadioItems', () => {
    it('returns an array of `GovukFrontendRadiosItem` objects from an array of prisons, sorted by `prisonName`', () => {
      const enabledOrganisations: Array<EnabledOrganisation> = [
        { code: 'B', description: 'B Prison' },
        { code: 'A', description: 'A Prison' },
      ]

      expect(OrganisationUtils.organisationRadioItems(enabledOrganisations)).toEqual([
        { text: 'A Prison', value: 'A' },
        { text: 'B Prison', value: 'B' },
      ])
    })

    describe('when a organisation has an `undefined` code or description', () => {
      it('filters out the organisation from the returned array', () => {
        const enabledOrganisations: Array<EnabledOrganisation> = [
          { code: 'B', description: 'B Prison' },
          { code: undefined, description: 'A Prison' },
          { code: 'A', description: undefined },
        ]

        expect(OrganisationUtils.organisationRadioItems(enabledOrganisations)).toEqual([
          { text: 'B Prison', value: 'B' },
        ])
      })
    })
  })

  describe('organisationSelectItems', () => {
    it('returns an array of `GovukFrontendSelectItem` objects from an array of prisons', () => {
      const prisons = [
        prisonFactory.build({ prisonId: 'an-ID-1', prisonName: 'Prison 1' }),
        prisonFactory.build({ prisonId: 'an-ID-2', prisonName: 'Prison 2' }),
      ]

      expect(OrganisationUtils.organisationSelectItems(prisons)).toEqual([
        { text: prisons[0].prisonName, value: prisons[0].prisonId },
        { text: prisons[1].prisonName, value: prisons[1].prisonId },
      ])
    })
  })

  describe('organisationTableRows', () => {
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

        expect(OrganisationUtils.organisationTableRows(organisationsWithOfferingIds)).toEqual([
          [
            {
              attributes: {
                'data-sort-value': organisationsWithOfferingIds[0].name,
              },
              html: `<a href="/find/offerings/${organisationsWithOfferingIds[0].courseOfferingId}">${organisationsWithOfferingIds[0].name}</a>`,
            },
            { text: organisationsWithOfferingIds[0].category },
            { text: organisationsWithOfferingIds[0].address.county },
          ],
          [
            {
              attributes: {
                'data-sort-value': organisationsWithOfferingIds[1].name,
              },
              html: `<a href="/find/offerings/${organisationsWithOfferingIds[1].courseOfferingId}">${organisationsWithOfferingIds[1].name}</a>`,
            },
            { text: organisationsWithOfferingIds[1].category },
            { text: organisationsWithOfferingIds[1].address.county },
          ],
          [
            {
              attributes: {
                'data-sort-value': organisationsWithOfferingIds[2].name,
              },
              html: `<a href="/find/offerings/${organisationsWithOfferingIds[2].courseOfferingId}">${organisationsWithOfferingIds[2].name}</a>`,
            },
            { text: organisationsWithOfferingIds[2].category },
            { text: organisationsWithOfferingIds[2].address.county },
          ],
        ])
      })
    })

    describe('when the county is `null`', () => {
      it('uses "Not found" in the county field', () => {
        const organisationWithOfferingId = organisationsWithOfferingIds[0]
        organisationWithOfferingId.address.county = null

        expect(OrganisationUtils.organisationTableRows([organisationWithOfferingId])).toEqual([
          [
            {
              attributes: {
                'data-sort-value': organisationWithOfferingId.name,
              },
              html: `<a href="/find/offerings/${organisationWithOfferingId.courseOfferingId}">${organisationWithOfferingId.name}</a>`,
            },
            { text: organisationWithOfferingId.category },
            { text: 'Not found' },
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
          secondaryContactEmail: undefined,
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
