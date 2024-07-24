export interface CourseCreateRequest {
  audienceId: string
  description: string
  name: string
  withdrawn: boolean
  alternateName?: string
}
