/**
 * Formats an ISO8601 datetime string into the format specified by the GOV.UK Style guide
 * e.g. 1 January 2022
 * https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style#dates
 * @param datestring A datetime string e.g. 2011-10-05T14:48:00.000Z or 2001-06-03
 * @returns A string
 * */
const govukFormattedFullDateString = (datestring: string): string => {
  return new Date(datestring).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default { govukFormattedFullDateString }
