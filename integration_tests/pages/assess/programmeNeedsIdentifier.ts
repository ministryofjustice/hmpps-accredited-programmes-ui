import { PniUtils } from '../../../server/utils'
import Page from '../page'
import type { Course, PeopleSearchResponse, PniScore } from '@accredited-programmes-api'

export default class ProgrammeNeedsIdentifierPage extends Page {
  personName: string

  constructor(args: { course: Course; prisoner: PeopleSearchResponse }) {
    const { course, prisoner } = args
    const personName = `${prisoner.firstName} ${prisoner.lastName}`

    super(`Referral to ${course.displayName}`, {
      hideTitleServiceName: false,
      pageTitleOverride: `Programme needs identifier for referral to ${course.displayName}`,
    })

    this.personName = personName
  }

  shouldContainOverrideInsetText() {
    cy.get('[data-testid="override-inset-text"]').within(() => {
      cy.get('h2').should('have.text', 'Referral does not match PNI')
      cy.get('p').should(
        'have.text',
        'This referral does not match the recommendation based on the risk and programme needs identifier (PNI) scores.',
      )
    })
  }

  shouldContainPathwayContent(programmePathway: PniScore['programmePathway']) {
    const pathwayContent = PniUtils.pathwayContent(this.personName, programmePathway)

    cy.get(`[data-testid="${pathwayContent.dataTestId}"]`).within(() => {
      cy.get('h2').should('have.text', pathwayContent.headingText)
      cy.get('p').should('have.text', pathwayContent.bodyText)
    })
  }

  shouldHaveIntroText() {
    cy.get('[data-testid="programme-needs-identifier-message"]').should(
      'have.text',
      "This is the recommended Accredited Programmes pathway. It is based on the person's risks and needs.",
    )
  }

  shouldNotContainOverrideInsetText() {
    cy.get('[data-testid="override-inset-text"]').should('not.exist')
  }
}
