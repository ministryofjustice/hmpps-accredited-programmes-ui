const pathWithQuery = (path: string, query: { [key: string]: string | number }) => {
  const queryString = Object.entries(query).reduce((accumulator, [key, value], entryIndex) => {
    let newString = accumulator

    if (entryIndex > 0) {
      newString += '&'
    }

    newString += `${key}=${value}`

    return newString
  }, '?')

  return path + queryString
}

export default pathWithQuery
