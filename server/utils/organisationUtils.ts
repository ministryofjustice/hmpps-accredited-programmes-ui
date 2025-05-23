import { findPaths } from '../paths'
import type { CourseOffering, Organisation, OrganisationAddress } from '@accredited-programmes/models'
import type {
  GovukFrontendSummaryListRowWithKeyAndValue,
  OrganisationWithOfferingEmailsPresenter,
  OrganisationWithOfferingId,
} from '@accredited-programmes/ui'
import type { Course } from '@accredited-programmes-api'
import type { GovukFrontendSelectItem, GovukFrontendTableRow } from '@govuk-frontend'
import type { Prison } from '@prison-register-api'

export default class OrganisationUtils {
  static organisationFromPrison(prison: Prison): Organisation {
    const { addressLine1, addressLine2, town, county, postcode, country } = prison.addresses[0]
    const categories = prison.categories.sort().join('/')

    return {
      id: prison.prisonId, // eslint-disable-next-line sort-keys
      address: { addressLine1, addressLine2, country, county, postalCode: postcode, town },
      category: categories,
      female: prison.female,
      name: prison.prisonName,
    }
  }

  static organisationSelectItems(organisations: Array<Prison>): Array<GovukFrontendSelectItem> {
    return organisations.map(organisation => {
      return {
        text: organisation.prisonName,
        value: organisation.prisonId,
      }
    })
  }

  static organisationSelectItemsForPrisonFilter(organisations: Array<Prison>): Array<GovukFrontendSelectItem> {
    const filteredItems: Array<GovukFrontendSelectItem> = organisations
      .filter(({ prisonId, prisonName }) => prisonId && prisonName)
      .sort((a, b) => a.prisonName!.localeCompare(b.prisonName!))
      .map(({ prisonId, prisonName }) => ({
        text: prisonName,
        value: prisonId,
      }))

    filteredItems.unshift({ text: '', value: '' })
    return filteredItems
  }

  static organisationTableRows(organisations: Array<OrganisationWithOfferingId>): Array<GovukFrontendTableRow> {
    return organisations.map(organisation => {
      const offeringPath = findPaths.offerings.show({
        courseOfferingId: organisation.courseOfferingId as string,
      })
      const contactOrganisationLink = `<a class="govuk-link" href="${offeringPath}">${organisation.name}</a>`

      return [
        {
          attributes: {
            'data-sort-value': organisation.name,
          },
          html: contactOrganisationLink,
        },
        { text: organisation.category },
        { text: organisation.address.county || 'Not found' },
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

  private static concatenatedOrganisationAddress(address: OrganisationAddress): string {
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
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    const summaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue> = [
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
