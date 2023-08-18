import { findPaths } from '../paths'
import type { Course, CourseOffering, Organisation, OrganisationAddress } from '@accredited-programmes/models'
import type {
  OrganisationWithOfferingEmailsPresenter,
  OrganisationWithOfferingEmailsSummaryListRows,
  OrganisationWithOfferingId,
} from '@accredited-programmes/ui'
import type { GovukFrontendTableRow } from '@govuk-frontend'
import type { Prison } from '@prison-register-api'

export default class OrganisationUtils {
  static organisationFromPrison(organisationId: Organisation['id'], prison: Prison): Organisation {
    const { addressLine1, addressLine2, town, county, postcode, country } = prison.addresses[0]
    const categories = prison.categories.sort().join('/')

    return {
      id: organisationId, // eslint-disable-next-line sort-keys
      address: { addressLine1, addressLine2, country, county, postalCode: postcode, town },
      category: categories,
      name: prison.prisonName,
    }
  }

  static organisationTableRows(
    course: Course,
    organisations: Array<OrganisationWithOfferingId>,
  ): Array<GovukFrontendTableRow> {
    return organisations.map(organisation => {
      const offeringPath = findPaths.offerings.show({
        courseId: course.id,
        courseOfferingId: organisation.courseOfferingId,
      })
      const visuallyHiddenPrisonInformation = `<span class="govuk-visually-hidden">(${organisation.name})</span>`
      const contactLink = `<a class="govuk-link" href="${offeringPath}">Contact prison ${visuallyHiddenPrisonInformation}</a>`

      return [
        { text: organisation.name },
        { text: organisation.category },
        { text: organisation.address.county || 'Not found' },
        { html: contactLink },
      ]
    })
  }

  static presentOrganisationWithOfferingEmails(
    organisation: Organisation,
    offering: CourseOffering,
    courseName: Course['name'],
  ): OrganisationWithOfferingEmailsPresenter {
    return {
      ...organisation,
      summaryListRows: OrganisationUtils.organisationWithOfferingEmailsSummaryListRows(
        organisation,
        offering,
        courseName,
      ),
    }
  }

  private static concatenatedOrganisationAddress = (address: OrganisationAddress): string => {
    return [address.addressLine1, address.addressLine2, address.town, address.county, address.postalCode]
      .filter(Boolean)
      .join(', ')
  }

  private static offeringEmailMailToLink(
    email: CourseOffering['contactEmail'] | CourseOffering['secondaryContactEmail'],
    organisationName: Organisation['name'],
    courseName: Course['name'],
  ): string {
    const subject = encodeURIComponent(`Accredited programme referral - ${organisationName} - ${courseName}`)
    return `<a class="govuk-link" href="mailto:${email}?subject=${subject}">${email}</a>`
  }

  private static organisationWithOfferingEmailsSummaryListRows(
    organisation: Organisation,
    offering: CourseOffering,
    courseName: Course['name'],
  ): OrganisationWithOfferingEmailsSummaryListRows {
    const summaryListRows: OrganisationWithOfferingEmailsSummaryListRows = [
      {
        key: { text: 'Prison category' },
        value: { text: organisation.category },
      },
      {
        key: { text: 'Address' },
        value: { text: OrganisationUtils.concatenatedOrganisationAddress(organisation.address) },
      },
      {
        key: { text: 'County' },
        value: { text: organisation.address.county || 'Not found' },
      },
      {
        key: { text: 'Email address' },
        value: {
          html: OrganisationUtils.offeringEmailMailToLink(offering.contactEmail, organisation.name, courseName),
        },
      },
    ]

    if (offering.secondaryContactEmail) {
      summaryListRows.push({
        key: { text: 'Secondary email address' },
        value: {
          html: OrganisationUtils.offeringEmailMailToLink(
            offering.secondaryContactEmail,
            organisation.name,
            courseName,
          ),
        },
      })
    }

    return summaryListRows
  }
}
