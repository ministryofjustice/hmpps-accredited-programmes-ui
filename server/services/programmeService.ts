import { AccreditedProgramme } from '../@types/shared/models/AccreditedProgramme'
import ProgrammeClient from '../data/programmeClient'

export default class ProgrammeService {
  constructor(private readonly programmeClient: ProgrammeClient) {}

  async getProgrammes(): Promise<Array<AccreditedProgramme>> {
    return this.programmeClient.all()
  }
}
