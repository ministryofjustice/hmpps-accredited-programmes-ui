/* istanbul ignore file */
import { RestClient } from '@ministryofjustice/hmpps-rest-client'

import logger from '../../../logger'
import config from '../../config'
import { apiPaths } from '../../paths'
import type { PniScore, Referral } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class PniClient {
  restClient: RestClient

  constructor(private readonly token: SystemToken) {
    this.restClient = new RestClient('pniClient', config.apis.accreditedProgrammesApi, logger)
  }

  async findPni(
    prisonNumber: Referral['prisonNumber'],
    query?: {
      gender?: string
      savePNI?: boolean
    },
  ): Promise<PniScore> {
    return (await this.restClient.get(
      {
        path: apiPaths.pni.show({ prisonNumber }),
        query: {
          ...(query?.gender && { gender: query.gender }),
          ...(query?.savePNI && { savePNI: 'true' }),
        },
      },
      this.token,
    )) as PniScore
  }
}
