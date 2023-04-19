import type { AccreditedProgramme } from '@accredited-programmes/models'
import { RestClientBuilder } from '../data'
import ProgrammeClient from '../data/programmeClient'

export default class ProgrammeService {
  constructor(private readonly programmeClientFactory: RestClientBuilder<ProgrammeClient>) {}

  async getProgrammes(token: string): Promise<Array<AccreditedProgramme>> {
    const programmeClient = this.programmeClientFactory(token)
    return programmeClient.all()
  }
}
