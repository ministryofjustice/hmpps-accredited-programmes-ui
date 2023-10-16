import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

import AuditService from './auditService'
import logger from '../../logger'

jest.mock('@aws-sdk/client-sqs')
jest.mock('../../logger')

describe('AuditService', () => {
  const MockSqsClient = SQSClient as jest.MockedClass<typeof SQSClient>
  const MockSendMessageCommand = SendMessageCommand as jest.MockedClass<typeof SendMessageCommand>

  const config = {
    accessKeyId: 'some-access-key-id',
    logErrors: false,
    queueUrl: 'some-queue-url',
    region: 'some-region',
    secretAccessKey: 'some-secret-access-key',
    serviceName: 'some-service-name',
  }

  describe('AuditService', () => {
    it('initialises the the SQS client', () => {
      // eslint-disable-next-line no-new
      new AuditService(config)

      expect(MockSqsClient).toHaveBeenCalledWith({
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        region: config.region,
      })
    })
  })

  describe('sendAuditMessage', () => {
    it('sends a messages using the SQS client, timestamped with the current time', async () => {
      const service = new AuditService(config)

      const date = new Date(2023, 3, 14)
      jest.useFakeTimers().setSystemTime(date)

      const expectedJsonMessage = JSON.stringify({
        details: JSON.stringify({ detailsParam: 'some-details' }),
        service: 'some-service-name',
        what: 'some-action',
        when: date,
        who: 'some-user-uuid',
      })

      await service.sendAuditMessage('some-action', 'some-user-uuid', { detailsParam: 'some-details' })

      expect(MockSendMessageCommand).toHaveBeenCalledWith({
        MessageBody: expectedJsonMessage,
        QueueUrl: 'some-queue-url',
      })
      expect(MockSqsClient.mock.instances[0].send).toHaveBeenCalledWith(MockSendMessageCommand.mock.instances[0])
    })

    it('does not propagate errors from from the SQS client', async () => {
      const service = new AuditService(config)

      MockSqsClient.prototype.send.mockImplementation(async () => {
        throw new Error()
      })

      await expect(
        service.sendAuditMessage('some-action', 'some-user-uuid', { detailsParam: 'some-details' }),
      ).resolves.not.toThrow()
    })

    it("does not log errors when 'logError' is configured to false", async () => {
      const service = new AuditService(config)

      MockSqsClient.prototype.send.mockImplementation(async () => {
        throw new Error()
      })

      await service.sendAuditMessage('some-action', 'some-user-uuiid', { detailParam: 'some-details' })

      expect(logger.error).not.toHaveBeenCalled()
    })

    it("logs errors when 'logError' is configured to true", async () => {
      const service = new AuditService({ ...config, logErrors: true })
      const error = new Error()

      MockSqsClient.prototype.send.mockImplementation(async () => {
        throw error
      })

      await service.sendAuditMessage('some-action', 'some-user-uuid', { detailParam: 'some-details' })

      expect(logger.error).toHaveBeenCalledWith('Problem sending audit message to SQS queue', error)
    })
  })
})
