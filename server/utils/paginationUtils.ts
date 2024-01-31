import type { Request } from 'express'

import PathUtils from './pathUtils'
import type { GovukFrontendPaginationWithItems, Paginated, QueryParam } from '@accredited-programmes/ui'
import type { GovukFrontendPaginationItem } from '@govuk-frontend'

export default class PaginationUtils {
  static pagination<T>(
    path: Request['path'],
    queryParamsExcludingPage: Array<QueryParam>,
    zeroIndexedPageNumber: Paginated<T>['pageNumber'],
    totalPages: Paginated<T>['totalPages'],
  ): GovukFrontendPaginationWithItems {
    const oneIndexedPageNumber = zeroIndexedPageNumber || 0 + 1
    const pagination: GovukFrontendPaginationWithItems = { items: [] }
    const pageNumbersToInclude = PaginationUtils.pageNumbersToInclude(oneIndexedPageNumber, totalPages)

    pageNumbersToInclude.forEach((includedNumber, includedNumberIndex) => {
      if (PaginationUtils.shouldAddEllipsis(pageNumbersToInclude, includedNumberIndex)) {
        pagination.items.push({ ellipsis: true, href: '' })
      }

      const item: GovukFrontendPaginationItem = {
        href: PaginationUtils.linkUrl(path, queryParamsExcludingPage, includedNumber),
        number: includedNumber.toString(),
      }

      if (includedNumber === oneIndexedPageNumber) {
        item.current = true
      }

      pagination.items.push(item)
    })

    if (oneIndexedPageNumber > 1) {
      pagination.previous = {
        href: PaginationUtils.linkUrl(path, queryParamsExcludingPage, oneIndexedPageNumber - 1),
      }
    }

    if (totalPages && oneIndexedPageNumber < totalPages) {
      pagination.next = {
        href: PaginationUtils.linkUrl(path, queryParamsExcludingPage, oneIndexedPageNumber + 1),
      }
    }

    return pagination
  }

  private static linkUrl(
    path: Request['path'],
    queryParamsExcludingPage: Array<QueryParam>,
    pageNumber: number,
  ): string {
    const queryParams = queryParamsExcludingPage.concat({ key: 'page', value: pageNumber.toString() })
    return PathUtils.pathWithQuery(path, queryParams)
  }

  private static pageNumbersToInclude<T>(
    currentPageNumber: number,
    totalPages: Paginated<T>['totalPages'],
  ): Array<number> {
    const previousPageNumber = currentPageNumber - 1
    const nextPageNumber = currentPageNumber + 1
    const allPossibleNumbers = Array.from(
      new Set([1, previousPageNumber, currentPageNumber || 1, nextPageNumber, totalPages]),
    )

    return allPossibleNumbers.filter(
      possibleNumber => possibleNumber && possibleNumber > 0 && possibleNumber <= (totalPages || currentPageNumber),
    ) as Array<number>
  }

  private static shouldAddEllipsis(pageNumbers: Array<number>, currentPageIndex: number): boolean {
    const currentPageNumber = pageNumbers[currentPageIndex]

    if (currentPageNumber === 1) {
      return false
    }

    const previousPageNumber = pageNumbers[currentPageIndex - 1]

    return currentPageNumber > previousPageNumber + 1
  }
}
