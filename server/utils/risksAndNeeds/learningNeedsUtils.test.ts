import LearningNeedsUtils from './learningNeedsUtils'
import type { LearningNeeds } from '@accredited-programmes/api'

describe('LearningNeedsUtils', () => {
  const learningNeeds: LearningNeeds = {
    basicSkillsScore: '6',
    // this one is missing on the API and will be added shortly
    // @ts-expect-error to fix later
    basicSkillsScoreDescription: 'Extra detail about the learning needs score',
    learningDifficulties: '0 - No problems',
    noFixedAbodeOrTransient: false,
    problemsReadWriteNum: '0 - No problems',
    qualifications: '0 - Any qualifications',
    workRelatedSkills: '0 - No problems',
  }

  describe('informationSummaryListRows', () => {
    it('formats the learnng needs data in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(LearningNeedsUtils.informationSummaryListRows(learningNeeds)).toEqual([
        {
          key: { text: '3.3 - Currently of no fixed abode or in transient accommodation' },
          value: { text: 'No' },
        },
        {
          key: { text: '4.4 - Work related skills' },
          value: { text: '0 - No problems' },
        },
        {
          key: { text: '4.7 - Has problems with reading, writing or numeracy' },
          value: { text: '0 - No problems' },
        },
        {
          key: { text: '4.8 - Has learning difficulties (optional)' },
          value: { text: '0 - No problems' },
        },
        {
          key: { text: '4.9 - Educational or formal professional / vocational qualifications (optional)' },
          value: { text: '0 - Any qualifications' },
        },
      ])
    })
  })

  describe('scoreSummaryListRows', () => {
    it('formats a learnng needs score and score description in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(LearningNeedsUtils.scoreSummaryListRows(learningNeeds)).toEqual([
        {
          key: { text: 'Calculated score' },
          value: { html: '6<br><br>Extra detail about the learning needs score' },
        },
      ])
    })

    describe("when there's no score description", () => {
      it('omits the description', () => {
        expect(
          // this one is missing on the API and will be added shortly
          // @ts-expect-error to fix later
          LearningNeedsUtils.scoreSummaryListRows({ ...learningNeeds, basicSkillsScoreDescription: undefined }),
        ).toEqual([
          {
            key: { text: 'Calculated score' },
            value: { html: '6' },
          },
        ])
      })
    })
  })
})
