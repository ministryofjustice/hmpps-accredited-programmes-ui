import RoshAnalysisUtils from './roshAnalysisUtils'
import { roshAnalysisFactory } from '../../testutils/factories'

describe('RoshAnalysisUtils', () => {
  const roshAnalysis = roshAnalysisFactory.build({
    anyoneElsePresent: 'Detail about anyone else present',
    howDone: 'Detail about how it was done',
    offenceDetails: 'Detail about the offence',
    sources: 'Detail about the source of information',
    whereAndWhen: 'Detail about where and when it was done',
    whoVictims: 'Detail about the victims',
    whyDone: 'Detail about why it was done',
  })

  describe('previousBehaviourSummaryListRows', () => {
    it('formats the impact and consequences offence details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(RoshAnalysisUtils.previousBehaviourSummaryListRows(roshAnalysis)).toEqual([
        {
          key: { text: 'What exactly did they do?' },
          value: { text: 'Detail about the offence' },
        },
        {
          key: { text: 'Where and when did they do it?' },
          value: { text: 'Detail about where and when it was done' },
        },
        {
          key: { text: 'How did they do it (was there any pre-planning, use of weapon, tool etc)?' },
          value: { text: 'Detail about how it was done' },
        },
        {
          key: {
            text: 'Who were the victims (were there concerns about targeting, type, age, race or vulnerability of victim)?',
          },
          value: { text: 'Detail about the victims' },
        },
        {
          key: { text: 'Was anyone else present / involved?' },
          value: { text: 'Detail about anyone else present' },
        },
        {
          key: { text: 'Why did they do it (motivation and triggers)?' },
          value: { text: 'Detail about why it was done' },
        },
        {
          key: { text: 'Source of information' },
          value: { text: 'Detail about the source of information' },
        },
      ])
    })
  })
})
