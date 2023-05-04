import { AccreditedProgramme } from '@accredited-programmes/models'

export type SummaryListRow = {
  key: {
    text: string
  }
  value: {
    text: string
  }
}

export type ProgrammeListItem = Omit<AccreditedProgramme, 'programmePrerequisites'> & {
  prerequisitesSummaryListRows: Array<SummaryListRow>
}
