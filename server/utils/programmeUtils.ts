import { omit } from 'lodash'

import { AccreditedProgramme, ProgrammePrerequisite } from '@accredited-programmes/models'
import { ProgrammeListItem, SummaryListRow } from '@accredited-programmes/ui'

export const prerequisiteSummaryListRows = (prerequisites: Array<ProgrammePrerequisite>): Array<SummaryListRow> => {
  return prerequisites.map(prerequisite => {
    return {
      key: { text: prerequisite.key },
      value: { text: prerequisite.value },
    }
  })
}

export const programmeListItems = (programmes: Array<AccreditedProgramme>): Array<ProgrammeListItem> => {
  return programmes.map(programme => {
    const prerequisitesSummaryListRows = prerequisiteSummaryListRows(programme.programmePrerequisites)

    return {
      ...omit(programme, ['programmePrerequisites']),
      prerequisitesSummaryListRows,
    }
  })
}
