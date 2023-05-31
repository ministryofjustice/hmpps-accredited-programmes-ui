import organisationTableRows from './organisationUtils'
import { courseFactory, organisationFactory } from '../testutils/factories'

describe('organisationUtils', () => {
  describe('organisationTableRows', () => {
    it('returns organisation data formatted for `govukTable` rows', () => {
      const course = courseFactory.build()
      const organisations = organisationFactory.buildList(3)

      expect(organisationTableRows(course, organisations)).toEqual([
        [
          { text: organisations[0].name },
          { text: organisations[0].category },
          { text: organisations[0].address.county },
          {
            html: `<a href="/programmes/${course.id}/prison/${organisations[0].id}" class="govuk-link">Contact prison <span class="govuk-visually-hidden">(${organisations[0].name})</span></a>`,
          },
        ],
        [
          { text: organisations[1].name },
          { text: organisations[1].category },
          { text: organisations[1].address.county },
          {
            html: `<a href="/programmes/${course.id}/prison/${organisations[1].id}" class="govuk-link">Contact prison <span class="govuk-visually-hidden">(${organisations[1].name})</span></a>`,
          },
        ],
        [
          { text: organisations[2].name },
          { text: organisations[2].category },
          { text: organisations[2].address.county },
          {
            html: `<a href="/programmes/${course.id}/prison/${organisations[2].id}" class="govuk-link">Contact prison <span class="govuk-visually-hidden">(${organisations[2].name})</span></a>`,
          },
        ],
      ])
    })
  })
})
