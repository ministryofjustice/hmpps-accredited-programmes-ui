import PathUtils from './pathUtils'

describe('PathUtils', () => {
  describe('pathWithQuery', () => {
    const path = 'a-path'

    describe('when there are no query params', () => {
      it('returns the path', () => {
        expect(PathUtils.pathWithQuery(path, [])).toEqual(path)
      })
    })

    describe('when there are query params', () => {
      it('returns the path with the query params in a URL-friendly format', () => {
        expect(
          PathUtils.pathWithQuery(path, [
            { key: 'sector', value: 'Information technology' },
            { key: 'region', value: 'South America' },
          ]),
        ).toEqual(`${path}?sector=Information+technology&region=South+America`)
      })
    })
  })
})
