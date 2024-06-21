export default class DateUtils {
  static calculateAge(dateString: string): { months: number; years: number } {
    const date = new Date(dateString)
    const now = new Date()
    let years = now.getFullYear() - date.getFullYear()
    let months = now.getMonth() - date.getMonth()

    if (months < 0) {
      years -= 1
      months += 12
    }

    return { months, years }
  }

  /**
   * Formats an ISO8601 datetime string into the format specified by the GOV.UK Style guide
   * e.g. 1 January 2022
   * https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style#dates
   * @param datestring A datetime string e.g. 2011-10-05T14:48:00.000Z or 2001-06-03
   * @returns A string
   * */
  static govukFormattedFullDateString(datestring?: string): string {
    const date = datestring ? new Date(datestring) : new Date()

    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  static removeTimezoneOffset(dateString: string): string {
    const date = new Date(dateString)
    const serverTimezoneOffset = date.getTimezoneOffset() * 60000

    return new Date(date.getTime() + serverTimezoneOffset).toISOString()
  }
}
