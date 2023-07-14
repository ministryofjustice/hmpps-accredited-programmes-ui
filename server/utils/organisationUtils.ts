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
  const categories = prison.categories.sort().join('/')

  return {
    id: organisationId,
    name: prison.prisonName,
    category: categories,
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

    return [
      { text: organisation.name },
      { text: organisation.category },
      { text: organisation.address.county || 'Not found' },
      { html: contactLink },
    ]
  })
}

const concatenatedOrganisationAddress = (address: OrganisationAddress): string => {
  return [address.addressLine1, address.addressLine2, address.town, address.county, address.postalCode]
    .filter(Boolean)
    .join(', ')
}

const offeringEmailMailToLink = (
  email: CourseOffering['contactEmail'] | CourseOffering['secondaryContactEmail'],
  organisationName: Organisation['name'],
  courseName: Course['name'],
): string => {
  const subject = encodeURIComponent(`Accredited programme referral - ${organisationName} - ${courseName}`)
  return `<a class="govuk-link" href="mailto:${email}?subject=${subject}">${email}</a>`
}

const organisationWithOfferingEmailsSummaryListRows = (
  organisation: Organisation,
  offering: CourseOffering,
  courseName: Course['name'],
): OrganisationWithOfferingEmailsSummaryListRows => {
  const summaryListRows: OrganisationWithOfferingEmailsSummaryListRows = [
    {
      key: { text: 'Prison category' },
      value: { text: organisation.category },
    },
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
      value: { html: offeringEmailMailToLink(offering.contactEmail, organisation.name, courseName) },
    },
  ]

  if (offering.secondaryContactEmail) {
    summaryListRows.push({
      key: { text: 'Secondary email address' },
      value: { html: offeringEmailMailToLink(offering.secondaryContactEmail, organisation.name, courseName) },
    })
  }

  return summaryListRows
}

const presentOrganisationWithOfferingEmails = (
  organisation: Organisation,
  offering: CourseOffering,
  courseName: Course['name'],
): OrganisationWithOfferingEmailsPresenter => {
  return {
    ...organisation,
    summaryListRows: organisationWithOfferingEmailsSummaryListRows(organisation, offering, courseName),
  }
}

export { organisationFromPrison, organisationTableRows, presentOrganisationWithOfferingEmails }
