import type { Property, TableDefinition } from '.'

const valuesSql = (records: Array<Record<string, string>>, uiProperties: Array<Property['ui']>): string => {
  const recordStrings = records.map(record => {
    const propertyStrings = uiProperties.map(uiProperty => {
      const value = record[uiProperty]

      if (typeof value === 'undefined') {
        return 'null'
      }
      if (typeof value === 'boolean') {
        return `${value}`
      }
      return `'${value}'`
    })

    return `(${propertyStrings.join(', ')})`
  })

  return `${recordStrings.join(',\n       ')};`
}

export default (tableDefinition: TableDefinition): string => {
  const { records, tableName } = tableDefinition
  const apiProperties: Array<string> = []
  const uiProperties: Array<string> = []
  tableDefinition.properties.forEach(property => {
    apiProperties.push(property.api)
    uiProperties.push(property.ui)
  })

  return `INSERT INTO ${tableName}(${apiProperties.join(', ')})
VALUES ${valuesSql(records, uiProperties)}`
}
