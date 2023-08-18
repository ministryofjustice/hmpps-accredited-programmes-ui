import type { NonEmptyArray } from '..'

type PrisonType = {
  code: string
  description: string
}

type PrisonAddress = {
  addressLine1: string | null
  addressLine2: string | null
  country: string
  county: string | null
  id: number
  postcode: string
  town: string
}

type PrisonOperator = {
  name: string
}

type Prison = {
  active: boolean
  addresses: NonEmptyArray<PrisonAddress>
  categories: Array<string>
  contracted: boolean
  female: boolean
  male: boolean
  operators: NonEmptyArray<PrisonOperator>
  prisonId: string
  prisonName: string
  types: NonEmptyArray<PrisonType>
}

export type { Prison, PrisonAddress }
