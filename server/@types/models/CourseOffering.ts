export type CourseOffering = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  contactEmail: string
  organisationEnabled: boolean
  organisationId: string
  referable: boolean
  secondaryContactEmail: string | null
}
