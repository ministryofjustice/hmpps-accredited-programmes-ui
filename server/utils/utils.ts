import pathWithQuery from './pathUtils'
import findPaths from '../paths/find'
import type { PaginatedArray } from '@accredited-programmes/ui'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

const convertToTitleCase = (sentence: string | null): string =>
  sentence === null || isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

const initialiseTitle = (sentence: string): string => {
  return sentence
    .split(' ')
    .map(word => word[0].toUpperCase())
    .join('')
}

const paginatedArray = <T>(items: Array<T>, currentPage = 1): PaginatedArray<T> => {
  const totalItems = items.length
  const perPage = 10
  const startIndex = perPage * (currentPage - 1)

  const totalPages = Math.ceil(totalItems / perPage)
  const coursesPath = findPaths.courses.index({})

  const pagesToShow = Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])).filter(
    (page: number) => page > 0 && page <= totalPages,
  )

  type MojPaginationConfigItem = { text: string; href: string; selected?: boolean } | { type: string }

  const mojPaginationConfigItems: Array<MojPaginationConfigItem> = []

  pagesToShow.forEach((pageNumber, pageNumberIndex) => {
    if (pageNumber !== 1 && pageNumber > pagesToShow[pageNumberIndex - 1] + 1) {
      mojPaginationConfigItems.push({ type: 'dots' })
    }

    const item: MojPaginationConfigItem = {
      text: pageNumber.toString(), // toString might be unnecessary
      href: pathWithQuery(coursesPath, { page: pageNumber }),
    }

    if (pageNumber === currentPage) {
      item.selected = true
    }

    mojPaginationConfigItems.push(item)
  })

  const mojPaginationConfig = {
    items: mojPaginationConfigItems,
    results: {
      count: totalItems,
      from: (currentPage - 1) * perPage + 1,
      to: Math.min(currentPage * perPage, totalItems),
      text: 'courses',
    },
  }

  return {
    page: currentPage,
    totalItems,
    items: items.slice(startIndex, startIndex + perPage),
    mojPaginationConfig,
  }
}

export { convertToTitleCase, initialiseName, initialiseTitle, paginatedArray }
