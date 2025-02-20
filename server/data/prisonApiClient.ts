import type { ApiConfig } from '../config'
import RestClient from './restClient'
import config from '../config'
import { prisonApiPaths } from '../paths'
import type { PeopleSearchResponse } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'
import type { Caseload, InmateDetail, OffenceDto, OffenderSentenceAndOffences, PageOffenceDto } from '@prison-api'

export default class PrisonApiClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('prisonApiClient', config.apis.prisonApi as ApiConfig, systemToken)
  }

  async findCurrentUserCaseloads(): Promise<Array<Caseload>> {
    return (await this.restClient.get({
      path: prisonApiPaths.caseloads.currentUser({}),
    })) as Array<Caseload>
  }

  async findOffencesThatStartWith(offenceCode: OffenceDto['code']): Promise<PageOffenceDto> {
    return (await this.restClient.get({
      path: prisonApiPaths.offenceCode({ offenceCode }),
    })) as PageOffenceDto
  }

  async findOffenderBookingByOffenderNo(offenderNo: PeopleSearchResponse['prisonerNumber']): Promise<InmateDetail> {
    return (await this.restClient.get({
      path: prisonApiPaths.offenderBookingDetail({ offenderNo }),
      query: {
        extraInfo: 'true',
      },
    })) as InmateDetail
  }

  async findSentenceAndOffenceDetails(
    bookingId: PeopleSearchResponse['bookingId'],
  ): Promise<OffenderSentenceAndOffences> {
    return (await this.restClient.get({
      path: prisonApiPaths.offenderSentenceAndOffences({ bookingId }),
    })) as OffenderSentenceAndOffences
  }
}
