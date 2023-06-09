import paths from '../paths/find'
import type { Course, CourseOffering, Organisation, OrganisationAddress } from '@accredited-programmes/models'
import type {
  OrganisationWithOfferingEmailPresenter,
  OrganisationWithOfferingEmailSummaryListRows,
  OrganisationWithOfferingId,
  TableRow,
} from '@accredited-programmes/ui'
import type { Prison } from '@prison-api'

const organisationFromPrison = (id: Organisation['id'], prison: Prison): Organisation => {
  const primaryAddress = prison.addresses.find(address => address.primary)

  return {
    id,
    name: prison.premise,
    category: 'N/A',
    address: {
      addressLine1: primaryAddress?.street || 'Not found',
      town: primaryAddress?.town || 'Not found',
      county: primaryAddress?.locality || 'Not found',
      postalCode: primaryAddress?.postalCode || 'Not found',
      country: primaryAddress?.country || 'Not found',
    },
  }
}

const organisationTableRows = (course: Course, organisations: Array<OrganisationWithOfferingId>): Array<TableRow> => {
  return organisations.map(organisation => {
    const offeringPath = paths.courses.offerings.show({
      id: course.id,
      courseOfferingId: organisation.courseOfferingId,
    })
    const visuallyHiddenPrisonInformation = `<span class="govuk-visually-hidden">(${organisation.name})</span>`
    const contactLink = `<a href="${offeringPath}" class="govuk-link">Contact prison ${visuallyHiddenPrisonInformation}</a>`

    return [
      { text: organisation.name },
      { text: organisation.category },
      { text: organisation.address.county },
      { html: contactLink },
    ]
  })
}

const concatenatedOrganisationAddress = (address: OrganisationAddress): string => {
  return [address.addressLine1, address.addressLine2, address.town, address.county, address.postalCode]
    .filter(Boolean)
    .join(', ')
}

const organisationWithOfferingEmailSummaryListRows = (
  organisation: Organisation,
  email: CourseOffering['contactEmail'],
): OrganisationWithOfferingEmailSummaryListRows => {
  return [
    {
      key: { text: 'Prison category' },
      value: { text: organisation.category },
    },
    {
      key: { text: 'Address' },
      value: { text: concatenatedOrganisationAddress(organisation.address) },
    },
    {
      key: { text: 'Region' },
      value: { text: organisation.address.county },
    },
    {
      key: { text: 'Email address' },
      value: { text: email },
    },
  ]
}

const presentOrganisationWithOfferingEmail = (
  organisation: Organisation,
  email: CourseOffering['contactEmail'],
): OrganisationWithOfferingEmailPresenter => {
  return {
    ...organisation,
    summaryListRows: organisationWithOfferingEmailSummaryListRows(organisation, email),
  }
}

export { organisationFromPrison, organisationTableRows, presentOrganisationWithOfferingEmail }
