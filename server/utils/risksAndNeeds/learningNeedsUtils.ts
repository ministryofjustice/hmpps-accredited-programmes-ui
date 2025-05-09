import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'
import type { LearningNeeds } from '@accredited-programmes-api'

export default class LearningNeedsUtils {
  static informationSummaryListRows(learningNeeds: LearningNeeds): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    const { problemAreas } = learningNeeds

    return [
      {
        key: { text: '3.3 - Currently of no fixed abode or in transient accommodation' },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(learningNeeds.noFixedAbodeOrTransient) },
      },
      {
        key: { text: '4.4 - Work related skills' },
        value: { text: ShowRisksAndNeedsUtils.textValue(learningNeeds.workRelatedSkills) },
      },
      {
        classes: problemAreas?.length ? 'no-border' : undefined,
        key: { text: '4.7 - Has problems with reading, writing or numeracy' },
        value: { text: ShowRisksAndNeedsUtils.textValue(learningNeeds.problemsReadWriteNum) },
      },
      ...(problemAreas?.length
        ? [
            {
              key: { text: 'Selected problem areas' },
              value: {
                html: `<ul class="govuk-list">${problemAreas.map(area => `<li>${area}</li>`).join('')}</ul>`,
              },
            },
          ]
        : []),
      {
        key: { text: '4.8 - Has learning difficulties (optional)' },
        value: { text: ShowRisksAndNeedsUtils.textValue(learningNeeds.learningDifficulties) },
      },
      {
        key: { text: '4.9 - Educational or formal professional / vocational qualifications (optional)' },
        value: { text: ShowRisksAndNeedsUtils.textValue(learningNeeds.qualifications) },
      },
    ]
  }

  static scoreSummaryListRows(learningNeeds: LearningNeeds): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    const scoreText = ShowRisksAndNeedsUtils.textValue(learningNeeds.basicSkillsScore)
    const descriptionText = learningNeeds.basicSkillsScoreDescription
      ? ShowRisksAndNeedsUtils.htmlTextValue(learningNeeds.basicSkillsScoreDescription)
      : undefined
    const valueHtml = [scoreText, descriptionText].filter(text => text).join('<br><br>')

    return [
      {
        key: { text: 'Calculated score' },
        value: { html: valueHtml },
      },
    ]
  }
}
