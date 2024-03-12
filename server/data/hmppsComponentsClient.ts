import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import type { AvailableComponent, Component } from '@hmpps-components'

export default class HmppsComponentsClient {
  restClient: RestClient

  userToken: Express.User['token']

  constructor(userToken: Express.User['token']) {
    this.userToken = userToken
    this.restClient = new RestClient('hmppsComponentsClient', config.apis.hmppsComponents as ApiConfig, userToken)
  }

  async getComponents<T extends Array<AvailableComponent>>(components: T): Promise<Record<T[number], Component>> {
    return this.restClient.get({
      headers: { 'x-user-token': this.userToken },
      path: '/components',
      query: `component=${components.join('&component=')}`,
    }) as Promise<Record<T[number], Component>>
  }
}
