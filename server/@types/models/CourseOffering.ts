export type CourseOffering = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  contactEmail: string
  organisationId: string
  referable: boolean
  // eslint-disable-next-line @typescript-eslint/sort-type-constituents
  gender?: 'MALE' | 'FEMALE' | 'ANY'
  secondaryContactEmail?: string
  withdrawn?: boolean
}
