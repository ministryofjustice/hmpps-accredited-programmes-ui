import type { QueryParam } from '@accredited-programmes/ui'

export default class PathUtils {
  static pathWithQuery(path: string, queryParams: Array<QueryParam>): string {
    if (!queryParams.length) {
      return path
    }

    const queryString = queryParams
      .map(({ key, value }) => {
        return `${key}=${value.replace(/\s/g, '+')}`
      })
      .join('&')

    return `${path}?${queryString}`
  }
}
