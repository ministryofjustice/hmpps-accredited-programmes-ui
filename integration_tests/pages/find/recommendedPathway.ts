import { PniUtils } from '../../../server/utils'
import Page from '../page'
import type { PniScore } from '@accredited-programmes-api'
import type { Prisoner } from '@prisoner-search'

export default class RecommendedPathwayPage extends Page {
  personName: string

  constructor(args: { prisoner: Prisoner }) {
    const { prisoner } = args
    const personName = `${prisoner.firstName} ${prisoner.lastName}`

    super(`Recommended programme pathway for ${personName}`, {
      hideTitleServiceName: false,
    })

    this.personName = personName
  }

  shouldContainAllInformationMissingStillMakeReferralText() {
    cy.get('[data-testid="still-make-referral-text"]').should(
      'have.text',
      'If you need to make a referral before you can update the risk and need scores, you can view the list of programmes and request an override. You will need to give a reason for this before you submit the referral.',
    )
  }

  shouldContainIntroText() {
    cy.get('.govuk-body').should(
      'contain.text',
      "This is the recommended Accredited Programme pathway. It is based on the person's risks and needs.",
    )
  }

  shouldContainNotEligibleStillMakeReferralText() {
    cy.get('[data-testid="still-make-referral-text"]').should(
      'have.text',
      'If you still think the person should be referred to an Accredited Programme, you can view the list of programmes and request an override. You will need to give a reason for this before you submit the referral.',
    )
  }

  shouldContainPathwayContent(programmePathway: PniScore['programmePathway']) {
    const pathwayContent = PniUtils.pathwayContent(this.personName, programmePathway)

    cy.get(`[data-testid="${pathwayContent.dataTestId}"]`).within(() => {
      cy.get('h2').should('have.text', pathwayContent.headingText)
      cy.get('p').should('have.text', pathwayContent.bodyText)
    })
  }

  shouldContainPniDetails(labelText: string) {
    cy.get('[data-testid="pni-details"]').should('exist').and('contain.text', labelText)
  }

  shouldContainStillMakeReferralHeading() {
    cy.get('[data-testid="still-make-referral-heading"]').should('have.text', 'If you still want to make a referral')
  }
}
