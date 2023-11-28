/* istanbul ignore file */

import type { RedisClient } from './redisClient'
import logger from '../../logger'

export default class TokenStore {
  private readonly prefix = 'systemToken:'

  constructor(private readonly client: RedisClient) {
    client.on('error', error => {
      logger.error(error, 'Redis error')
    })
  }

  public async getToken(key: string): Promise<string | null> {
    await this.ensureConnected()
    return this.client.get(`${this.prefix}${key}`)
  }

  public async setToken(key: string, userToken: Express.User['token'], durationSeconds: number): Promise<void> {
    await this.ensureConnected()
    await this.client.set(`${this.prefix}${key}`, userToken, { EX: durationSeconds })
  }

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }
}
