/* eslint-disable no-console */

import type { Response, SuperAgentRequest } from 'superagent'
import superagent from 'superagent'

const wiremockEndpoint = process.env.CYPRESS ? 'http://localhost:9199' : 'http://localhost:9099'

const url = `${wiremockEndpoint}/__admin`

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const getMatchingRequests = (body: object) => superagent.post(`${url}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

type ReturnsSuperAgentRequest = () => SuperAgentRequest

const processStubs = (stubs: Array<ReturnsSuperAgentRequest>): void => {
  stubs.forEach(stub =>
    stub().then(response => {
      console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
    }),
  )
}

export { getMatchingRequests, processStubs, resetStubs, stubFor }
export type { ReturnsSuperAgentRequest }
