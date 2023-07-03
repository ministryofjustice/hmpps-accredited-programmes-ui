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

const paginatedArray = <T>(items: Array<T>, page = 1): PaginatedArray<T> => {
  const totalItems = items.length
  const perPage = 10
  const startIndex = perPage * (page - 1)

  return {
    page,
    totalItems,
    items: items.slice(startIndex, startIndex + perPage),
  }
}

export { convertToTitleCase, initialiseName, initialiseTitle, paginatedArray }
