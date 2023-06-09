import findPaths from '../paths/find'
import type { Course, CourseOffering, Organisation, OrganisationAddress } from '@accredited-programmes/models'
import type {
  OrganisationWithOfferingEmailsPresenter,
  OrganisationWithOfferingEmailsSummaryListRows,
  OrganisationWithOfferingId,
  TableRow,
} from '@accredited-programmes/ui'
import type { Prison } from '@prison-register-api'

const organisationFromPrison = (organisationId: Organisation['id'], prison: Prison): Organisation => {
  const { addressLine1, addressLine2, town, county, postcode, country } = prison.addresses[0]

  return {
    id: organisationId,
    name: prison.prisonName,
    category: 'N/A',
    address: { addressLine1, addressLine2, town, county, postalCode: postcode, country },
  }
}

const organisationTableRows = (course: Course, organisations: Array<OrganisationWithOfferingId>): Array<TableRow> => {
  return organisations.map(organisation => {
    const offeringPath = findPaths.courses.offerings.show({
      courseId: course.id,
      courseOfferingId: organisation.courseOfferingId,
    })
    const visuallyHiddenPrisonInformation = `<span class="govuk-visually-hidden">(${organisation.name})</span>`
    const contactLink = `<a class="govuk-link" href="${offeringPath}">Contact prison ${visuallyHiddenPrisonInformation}</a>`

    return [{ text: organisation.name }, { text: organisation.address.county || 'Not found' }, { html: contactLink }]
  })
}

const concatenatedOrganisationAddress = (address: OrganisationAddress): string => {
  return [address.addressLine1, address.addressLine2, address.town, address.county, address.postalCode]
    .filter(Boolean)
    .join(', ')
}

const organisationWithOfferingEmailSummaryListRows = (
  organisation: Organisation,
  offering: CourseOffering,
): OrganisationWithOfferingEmailsSummaryListRows => {
  const mailToLink = (email: string) => `<a class="govuk-link" href="mailto:${email}">${email}</a>`

  const summaryListRows: OrganisationWithOfferingEmailsSummaryListRows = [
    {
      key: { text: 'Address' },
      value: { text: concatenatedOrganisationAddress(organisation.address) },
    },
    {
      key: { text: 'County' },
      value: { text: organisation.address.county || 'Not found' },
    },
    {
      key: { text: 'Email address' },
      value: { html: mailToLink(offering.contactEmail) },
    },
  ]

  if (offering.secondaryContactEmail) {
    summaryListRows.push({
      key: { text: 'Secondary email address' },
      value: { html: mailToLink(offering.secondaryContactEmail) },
    })
  }

  return summaryListRows
}

const presentOrganisationWithOfferingEmails = (
  organisation: Organisation,
  offering: CourseOffering,
): OrganisationWithOfferingEmailsPresenter => {
  return {
    ...organisation,
    summaryListRows: organisationWithOfferingEmailSummaryListRows(organisation, offering),
  }
}

export { organisationFromPrison, organisationTableRows, presentOrganisationWithOfferingEmails }
