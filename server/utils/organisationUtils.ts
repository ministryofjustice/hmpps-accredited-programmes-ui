import paths from '../paths/find'
import type { Course, Organisation } from '@accredited-programmes/models'
import type { TableRow } from '@accredited-programmes/ui'

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

export default organisationTableRows
