import { RestClientBuilder } from '../data'
import ProgrammeClient from '../data/programmeClient'
import type { AccreditedProgramme } from '@accredited-programmes/models'

export default class ProgrammeService {
  constructor(private readonly programmeClientFactory: RestClientBuilder<ProgrammeClient>) {}

  async getProgrammes(token: string): Promise<Array<AccreditedProgramme>> {
    const programmeClient = this.programmeClientFactory(token)
    return programmeClient.all()
  }
}
