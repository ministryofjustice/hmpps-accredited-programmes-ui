import type { Response, SuperAgentRequest } from 'superagent'
import superagent from 'superagent'

const wiremockEndpoint = process.env.CYPRESS ? 'http://localhost:9091' : 'http://localhost:9093'

const url = `${wiremockEndpoint}/__admin`

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const getMatchingRequests = (body: object) => superagent.post(`${url}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

export { getMatchingRequests, resetStubs, stubFor }
