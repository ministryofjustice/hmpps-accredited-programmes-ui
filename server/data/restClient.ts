import Agent, { HttpsAgent } from 'agentkeepalive'
import { Readable } from 'stream'
import superagent from 'superagent'

import { restClientMetricsMiddleware } from './restClientMetricsMiddleware'
import logger from '../../logger'
import type { ApiConfig } from '../config'
import type { UnsanitisedError } from '../sanitisedError'
import sanitiseError from '../sanitisedError'

interface GetRequest {
  headers?: Record<string, string>
  path?: string
  query?: string
  raw?: boolean
  responseType?: string
}

interface PostRequest {
  data?: Record<string, unknown>
  headers?: Record<string, string>
  path?: string
  raw?: boolean
  responseType?: string
}

interface PutRequest extends PostRequest {}

interface StreamRequest {
  errorLogger?: (e: UnsanitisedError) => void
  headers?: Record<string, string>
  path?: string
}

export default class RestClient {
  agent: Agent

  constructor(
    private readonly name: string,
    private readonly config: ApiConfig,
    private readonly token: Express.User['token'],
  ) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
  }

  async get({ path = '', query = '', headers = {}, responseType = '', raw = false }: GetRequest): Promise<unknown> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path} ${query}`)
    try {
      const result = await superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .use(restClientMetricsMiddleware)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error as UnsanitisedError)
      logger.warn({ ...sanitisedError, query }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }

  async post(request: PostRequest = {}): Promise<unknown> {
    return this.postOrPut('post', request)
  }

  async put(request: PutRequest = {}): Promise<unknown> {
    return this.postOrPut('put', request)
  }

  async stream({ path = '', headers = {} }: StreamRequest = {}): Promise<unknown> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path}`)
    return new Promise((resolve, reject) => {
      superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .use(restClientMetricsMiddleware)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(this.timeoutConfig())
        .set(headers)
        .end((error, response) => {
          if (error) {
            logger.warn(sanitiseError(error), `Error calling ${this.name}`)
            reject(error)
          } else if (response) {
            const s = new Readable()
            // eslint-disable-next-line no-underscore-dangle
            s._read = () => {
              // Do nothing
            }
            s.push(response.body)
            s.push(null)
            resolve(s)
          }
        })
    })
  }

  private apiUrl() {
    return this.config.url
  }

  private async postOrPut(
    method: 'post' | 'put',
    { path = '', headers = {}, responseType = '', data = {}, raw = false }: PutRequest | PostRequest = {},
  ): Promise<unknown> {
    logger.info(`${method} using user credentials: calling ${this.name}: ${path}`)
    try {
      const request =
        method === 'post' ? superagent.post(`${this.apiUrl()}${path}`) : superagent.put(`${this.apiUrl()}${path}`)

      const result = await request
        .send(data)
        .agent(this.agent)
        .use(restClientMetricsMiddleware)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error as UnsanitisedError)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: '${method}'`)
      throw sanitisedError
    }
  }

  private timeoutConfig() {
    return this.config.timeout
  }
}
