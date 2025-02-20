import { findPaths } from '../../../server/paths'
import Page from '../page'
import type { PeopleSearchResponse, PniScore } from '@accredited-programmes-api'

export default class NotRecommendedProgrammePage extends Page {
  personName: string

  constructor(args: { prisoner: PeopleSearchResponse; programmePathway: PniScore['programmePathway'] }) {
    const { prisoner, programmePathway } = args
    const personName = `${prisoner.firstName} ${prisoner.lastName}`

    const pathwayTitleMap: Record<PniScore['programmePathway'], string> = {
      HIGH_INTENSITY_BC: 'Not recommended: moderate intensity Accredited Programmes',
      MODERATE_INTENSITY_BC: 'Not recommended: high intensity Accredited Programmes',
    }

    super(pathwayTitleMap[programmePathway] || 'Accredited Programmes', {
      hideTitleServiceName: false,
    })

    this.personName = personName
  }

  shouldContainHighIntensityContent() {
    this.shouldContainText(
      `These programmes are not recommended for people with high risks and needs, like ${this.personName}`,
    )
    this.shouldContainOverrideText()
    this.shouldContainSeeRecommendedProgrammesButton()
  }

  shouldContainModerateIntensityContent() {
    this.shouldContainText(
      `These programmes are not recommended for people with medium risks and needs, like ${this.personName}`,
    )
    this.shouldContainOverrideText()
    this.shouldContainSeeRecommendedProgrammesButton()
  }

  shouldContainOverrideText() {
    this.shouldContainText(
      'You can make a referral anyway and the treatment manager will decide whether an override is appropriate. You will need to give a reason before you submit the referral.',
    )
  }

  shouldContainSeeRecommendedProgrammesButton() {
    cy.get('[data-testid="recommended-programmes-button"]')
      .should('contain.text', 'See recommended programmes')
      .should('have.attr', 'href', findPaths.pniFind.recommendedProgrammes.pattern)
  }
}
