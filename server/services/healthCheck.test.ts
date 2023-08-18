import type { HealthCheckCallback, HealthCheckService } from './healthCheck'
import healthCheck from './healthCheck'

describe('healthCheck', () => {
  describe('when all checks are successful', () => {
    it('reports healthy', done => {
      const checks = [successfulCheck('check1'), successfulCheck('check2')]

      const callback: HealthCheckCallback = result => {
        expect(result).toEqual(
          expect.objectContaining({
            checks: { check1: 'some message', check2: 'some message' },
            healthy: true,
          }),
        )
        done()
      }

      healthCheck(callback, checks)
    })
  })

  describe('when any check is unsuccessful', () => {
    it('reports unhealthy', done => {
      const checks = [successfulCheck('check1'), erroredCheck('check2')]

      const callback: HealthCheckCallback = result => {
        expect(result).toEqual(
          expect.objectContaining({
            checks: { check1: 'some message', check2: 'some error' },
            healthy: false,
          }),
        )
        done()
      }

      healthCheck(callback, checks)
    })
  })
})

function successfulCheck(name: string): HealthCheckService {
  return () =>
    Promise.resolve({
      message: 'some message',
      name: `${name}`,
      status: 'ok',
    })
}

function erroredCheck(name: string): HealthCheckService {
  return () =>
    Promise.resolve({
      message: 'some error',
      name: `${name}`,
      status: 'ERROR',
    })
}
