import nock from 'nock'

afterAll(() => {
  nock.abortPendingRequests()
  nock.cleanAll()
  nock.restore()
})
