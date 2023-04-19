import { ProgrammePrerequisite } from './ProgrammePrerequisite'

export type AccreditedProgramme = {
  name: string
  programmeType: string
  description: string
  programmePrerequisites: Array<ProgrammePrerequisite>
}
