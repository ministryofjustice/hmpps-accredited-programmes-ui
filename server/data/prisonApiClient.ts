import { RestClient } from '@ministryofjustice/hmpps-rest-client'

import logger from '../../logger'
import config from '../config'
import { prisonApiPaths } from '../paths'
import type { PeopleSearchResponse } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'
import type { Caseload, InmateDetail, OffenceDto, OffenderSentenceAndOffences, PageOffenceDto } from '@prison-api'

export default class PrisonApiClient {
  restClient: RestClient

  constructor(private readonly token: SystemToken) {
    this.restClient = new RestClient('prisonApiClient', config.apis.prisonApi, logger)
  }

  async findCurrentUserCaseloads(): Promise<Array<Caseload>> {
    return (await this.restClient.get(
      {
        path: prisonApiPaths.caseloads.currentUser({}),
      },
      this.token,
    )) as Array<Caseload>
  }

  async findOffencesThatStartWith(offenceCode: OffenceDto['code']): Promise<PageOffenceDto> {
    return (await this.restClient.get(
      {
        path: prisonApiPaths.offenceCode({ offenceCode }),
      },
      this.token,
    )) as PageOffenceDto
  }

  async findOffenderBookingByOffenderNo(offenderNo: PeopleSearchResponse['prisonerNumber']): Promise<InmateDetail> {
    return (await this.restClient.get(
      {
        path: prisonApiPaths.offenderBookingDetail({ offenderNo }),
        query: {
          extraInfo: 'true',
        },
      },
      this.token,
    )) as InmateDetail
  }

  async findSentenceAndOffenceDetails(
    bookingId: PeopleSearchResponse['bookingId'],
  ): Promise<OffenderSentenceAndOffences> {
    return (await this.restClient.get(
      {
        path: prisonApiPaths.offenderSentenceAndOffences({ bookingId }),
      },
      this.token,
    )) as OffenderSentenceAndOffences
  }
}
