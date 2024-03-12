import HmppsComponentsService from './hmppsComponentsService'
import { HmppsComponentsClient } from '../data'
import type { AvailableComponent, Component } from '@hmpps-components'

jest.mock('../data/hmppsComponentsClient')

describe('hmppsComponentsService', () => {
  const userToken = 'SOME-USER-TOKEN'
  const components: Array<AvailableComponent> = ['footer', 'header']

  const hmppsComponentsClient = new HmppsComponentsClient(userToken) as jest.Mocked<HmppsComponentsClient>
  const hmppsComponentsClientBuilder = jest.fn()

  const service = new HmppsComponentsService(hmppsComponentsClientBuilder)

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsComponentsClientBuilder.mockReturnValue(hmppsComponentsClient)
  })

  describe('getComponents', () => {
    it('should call the hmppsComponentsClient correctly and return the response', async () => {
      const response: Record<string, Component> = {
        footer: {
          css: ['some-css'],
          html: 'some-html',
          javascript: ['some-javascript'],
        },
        header: {
          css: ['some-css'],
          html: 'some-html',
          javascript: ['some-javascript'],
        },
      }

      hmppsComponentsClient.getComponents.mockResolvedValue(response)

      const result = await service.getComponents(components, userToken)

      expect(result).toEqual(response)
      expect(hmppsComponentsClient.getComponents).toHaveBeenCalledWith(components)
    })
  })
})
