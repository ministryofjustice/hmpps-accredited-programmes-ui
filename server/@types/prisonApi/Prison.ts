export type Prison = {
  agencyId: string
  premise: string
  locality: string
  city: string
  country: string
  addresses: PrisonAddress[]
}

type PrisonAddress = {
  premise: string
  street: string
  locality: string
  town: string
  postalCode: string
  country: string
  primary: boolean
}
