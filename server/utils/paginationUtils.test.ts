import PaginationUtils from './paginationUtils'

describe('pagination', () => {
  const path = 'a-path'
  const queryParams = [
    { key: 'strand', value: 'general violence offence' },
    { key: 'status', value: 'referral started' },
  ]
  const pathWithQuery = 'a-path?strand=general+violence+offence&status=referral+started'

  describe('when there are no pages', () => {
    it('returns a pagination object with no items or buttons', () => {
      expect(PaginationUtils.pagination(path, queryParams, 0, 0)).toEqual({ items: [] })
    })
  })

  describe("when there's only one page", () => {
    it('returns a pagination object with just the current page', () => {
      expect(PaginationUtils.pagination(path, queryParams, 0, 1)).toEqual({
        items: [{ current: true, href: `${pathWithQuery}&page=1`, number: '1' }],
      })
    })
  })

  describe('when there are pages to the right', () => {
    describe('one', () => {
      it('returns a pagination object with the current page, the next page, and a next button', () => {
        expect(PaginationUtils.pagination(path, queryParams, 0, 2)).toEqual({
          items: [
            { current: true, href: `${pathWithQuery}&page=1`, number: '1' },
            { href: `${pathWithQuery}&page=2`, number: '2' },
          ],
          next: { href: `${pathWithQuery}&page=2` },
        })
      })
    })

    describe('two', () => {
      it('returns a pagination object with the current page, the next two pages, and a next button', () => {
        expect(PaginationUtils.pagination(path, queryParams, 0, 3)).toEqual({
          items: [
            { current: true, href: `${pathWithQuery}&page=1`, number: '1' },
            { href: `${pathWithQuery}&page=2`, number: '2' },
            { href: `${pathWithQuery}&page=3`, number: '3' },
          ],
          next: { href: `${pathWithQuery}&page=2` },
        })
      })
    })

    describe('three or more', () => {
      it('returns a pagination object with the current page, the next page, an ellipsis, the last page, and a next button', () => {
        expect(PaginationUtils.pagination(path, queryParams, 0, 4)).toEqual({
          items: [
            { current: true, href: `${pathWithQuery}&page=1`, number: '1' },
            { href: `${pathWithQuery}&page=2`, number: '2' },
            { ellipsis: true, href: '' },
            { href: `${pathWithQuery}&page=4`, number: '4' },
          ],
          next: { href: `${pathWithQuery}&page=2` },
        })
      })
    })
  })

  describe('when there are pages to the left', () => {
    describe('one', () => {
      it('returns a pagination object with a previous button, the previous page, and the current page', () => {
        expect(PaginationUtils.pagination(path, queryParams, 1, 2)).toEqual({
          items: [
            { href: `${pathWithQuery}&page=1`, number: '1' },
            { current: true, href: `${pathWithQuery}&page=2`, number: '2' },
          ],
          previous: { href: `${pathWithQuery}&page=1` },
        })
      })
    })

    describe('two', () => {
      it('returns a pagination object with a previous button, the previous two pages, and the current page', () => {
        expect(PaginationUtils.pagination(path, queryParams, 2, 3)).toEqual({
          items: [
            { href: `${pathWithQuery}&page=1`, number: '1' },
            { href: `${pathWithQuery}&page=2`, number: '2' },
            { current: true, href: `${pathWithQuery}&page=3`, number: '3' },
          ],
          previous: { href: `${pathWithQuery}&page=2` },
        })
      })
    })

    describe('three or more', () => {
      it('returns a pagination object with a previous button, the first page, an ellipsis, the previous page, and the current page', () => {
        expect(PaginationUtils.pagination(path, queryParams, 3, 4)).toEqual({
          items: [
            { href: `${pathWithQuery}&page=1`, number: '1' },
            { ellipsis: true, href: '' },
            { href: `${pathWithQuery}&page=3`, number: '3' },
            { current: true, href: `${pathWithQuery}&page=4`, number: '4' },
          ],
          previous: { href: `${pathWithQuery}&page=3` },
        })
      })
    })
  })
})
