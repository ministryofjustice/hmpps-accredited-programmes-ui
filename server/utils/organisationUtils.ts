import paths from '../paths/find'
import type { Course, Organisation } from '@accredited-programmes/models'
import type { TableRow } from '@accredited-programmes/ui'
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

const organisationTableRows = (course: Course, organisations: Array<Organisation>): Array<TableRow> => {
  return organisations.map(organisation => {
    const offeringPath = paths.courseOffering.show({ id: course.id, organisationId: organisation.id })
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

export { organisationFromPrison, organisationTableRows }
