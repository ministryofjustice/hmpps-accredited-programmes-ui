export default class StringUtils {
  static convertToTitleCase(sentence: string | null): string {
    return sentence === null || StringUtils.isBlank(sentence)
      ? ''
      : sentence.split(' ').map(StringUtils.properCaseName).join(' ')
  }

  static initialiseName(fullName?: string): string | null {
    // this check is for the authError page
    if (!fullName) return null

    const array = fullName.split(' ')
    return `${array[0][0]}. ${array.reverse()[0]}`
  }

  static initialiseTitle(sentence: string): string {
    return sentence
      .split(' ')
      .map(word => word[0].toUpperCase())
      .join('')
  }

  static makePossessive(word: string): string {
    return word.endsWith('s') ? `${word}'` : `${word}'s`
  }

  static pluralise(word: string, count: number): string {
    return count === 1 ? word : `${word}s`
  }

  static properCase(word: string): string {
    return word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word
  }

  private static isBlank(str: string): boolean {
    return !str || /^\s*$/.test(str)
  }

  /**
   * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
   * correctly (i.e. each part in a double-barreled is converted to proper case).
   * @param name name to be converted.
   * @returns name converted to proper case.
   */
  private static properCaseName(name: string): string {
    return StringUtils.isBlank(name) ? '' : name.split('-').map(StringUtils.properCase).join('-')
  }
}
