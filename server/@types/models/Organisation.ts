export type Organisation = {
  name: string
  category: string
  address: Address
}

type Address = {
  addressLine1: string
  addressLine2?: string
  town: string
  county: string
  postalCode: string
  country: string
}
