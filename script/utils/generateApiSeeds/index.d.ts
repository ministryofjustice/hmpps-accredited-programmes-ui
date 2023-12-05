type Property = { api: string; ui: string }

type TableDefinition = {
  properties: Array<Property>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  records: Array<Record<string, any>>
  tableName: string
}

export type { Property, TableDefinition }
