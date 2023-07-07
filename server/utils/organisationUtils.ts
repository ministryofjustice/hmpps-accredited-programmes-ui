import findPaths from '../paths/find'
import type { Course, CourseOffering, Organisation, OrganisationAddress } from '@accredited-programmes/models'
import type {
  OrganisationWithOfferingEmailPresenter,
  OrganisationWithOfferingEmailSummaryListRows,
  OrganisationWithOfferingId,
  TableRow,
} from '@accredited-programmes/ui'
import type { Prison } from '@prison-register-api'

const organisationFromPrison = (id: Organisation['id'], prison: Prison): Organisation => {
  const { addressLine1, addressLine2, town, county, postcode, country } = prison.addresses[0]

  return {
    id,
    name: prison.prisonName,
    category: 'N/A',
    address: { addressLine1, addressLine2, town, county, postalCode: postcode, country },
  }
}

const organisationTableRows = (course: Course, organisations: Array<OrganisationWithOfferingId>): Array<TableRow> => {
  return organisations.map(organisation => {
    const offeringPath = findPaths.courses.offerings.show({
      id: course.id,
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
  email: CourseOffering['contactEmail'],
): OrganisationWithOfferingEmailSummaryListRows => {
  return [
    {
      key: { text: 'Address' },
      value: { text: concatenatedOrganisationAddress(organisation.address) },
    },
    {
      key: { text: 'Region' },
      value: { text: organisation.address.county || 'Not found' },
    },
    {
      key: { text: 'Email address' },
      value: { html: `<a class="govuk-link" href="mailto:${email}">${email}</a>` },
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
