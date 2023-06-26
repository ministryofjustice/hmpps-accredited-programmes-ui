import type { HealthCheckCallback, HealthCheckService } from './healthCheck'
import healthCheck from './healthCheck'

describe('healthCheck', () => {
  describe('when all checks are successful', () => {
    it('reports healthy', done => {
      const checks = [successfulCheck('check1'), successfulCheck('check2')]

      const callback: HealthCheckCallback = result => {
        expect(result).toEqual(
          expect.objectContaining({
            healthy: true,
            checks: { check1: 'some message', check2: 'some message' },
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
            healthy: false,
            checks: { check1: 'some message', check2: 'some error' },
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
      name: `${name}`,
      status: 'ok',
      message: 'some message',
    })
}

function erroredCheck(name: string): HealthCheckService {
  return () =>
    Promise.resolve({
      name: `${name}`,
      status: 'ERROR',
      message: 'some error',
    })
}
