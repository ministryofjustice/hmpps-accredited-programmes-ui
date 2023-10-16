import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

import logger from '../../logger'
import type { AuditConfig } from '../config'

export default class AuditService {
  private readonly logErrors: boolean

  private readonly queueUrl: string

  private readonly serviceName: string

  private readonly sqsClient: SQSClient

  constructor(config: AuditConfig) {
    this.sqsClient = new SQSClient({
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      region: config.region,
    })

    this.serviceName = config.serviceName
    this.queueUrl = config.queueUrl
    this.logErrors = config.logErrors
  }

  async sendAuditMessage(action: string, username: string, details: Record<string, string>) {
    const jsonDetails = JSON.stringify(details)

    const jsonMessage = JSON.stringify({
      details: jsonDetails,
      service: this.serviceName,
      what: action,
      when: new Date(),
      who: username,
    })

    try {
      logger.info(`Sending audit message ${action} (${jsonDetails})`)
      await this.sqsClient.send(
        new SendMessageCommand({
          MessageBody: jsonMessage,
          QueueUrl: this.queueUrl,
        }),
      )
    } catch (error) {
      if (this.logErrors) {
        logger.error('Problem sending audit message to SQS queue', error)
      }
    }
  }
}
