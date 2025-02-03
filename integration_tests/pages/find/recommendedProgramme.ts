import Page from '../page'
import type { PniScore } from '@accredited-programmes-api'
import type { Prisoner } from '@prisoner-search'

export default class RecommendedProgrammePage extends Page {
  personName: string

  constructor(args: { prisoner: Prisoner; programmePathway: PniScore['programmePathway'] }) {
    const { prisoner, programmePathway } = args
    const personName = `${prisoner.firstName} ${prisoner.lastName}`

    const pathwayTitleMap: Record<PniScore['programmePathway'], string> = {
      ALTERNATIVE_PATHWAY: 'Accredited Programmes: not recommended',
      HIGH_INTENSITY_BC: 'Recommended: high intensity Accredited Programmes',
      MODERATE_INTENSITY_BC: 'Recommended: moderate intensity Accredited Programmes',
    }

    super(pathwayTitleMap[programmePathway] || 'Accredited Programmes', {
      hideTitleServiceName: false,
    })

    this.personName = personName
  }

  shouldContainAlternativePathwayContent() {
    this.shouldContainText(
      `Accredited Programmes are not recommended for people who may not be eligible based on risks and needs, like ${this.personName}`,
    )
    this.shouldContainText(
      'You can make a referral anyway and the treatment manager will decide whether an override is appropriate. You will need to give a reason before you submit the referral.',
    )
  }

  shouldContainHighIntensityContent() {
    this.shouldContainText('These programmes are recommended for people with high or very high risks and needs.')
  }

  shouldContainMissingInformationContent() {
    this.shouldContainWarningText('Update layer 3 assessment scores')
    this.shouldContainText(
      `${this.personName} may not be eligible for these programmes based on risks and needs. Information is missing from the risk and need assessment.`,
    )
    this.shouldContainText(
      'You can make a referral anyway and the treatment manager will decide whether an override is appropriate. You will need to give a reason before you submit the referral.',
    )
  }

  shouldContainModerateIntensityContent() {
    this.shouldContainText('These programmes are recommended for people with medium risks and needs.')
  }

  shouldContainNoPniContent() {
    this.shouldContainWarningText('Update risk and need assessment scores')
    this.shouldContainText(
      `${this.personName} may not be eligible for these programmes based on risks and needs. Information is missing from the layer 3 assessment.`,
    )
    this.shouldContainText(
      'You can make a referral anyway and the treatment manager will decide whether an override is appropriate. You will need to give a reason before you submit the referral.',
    )
  }
}
