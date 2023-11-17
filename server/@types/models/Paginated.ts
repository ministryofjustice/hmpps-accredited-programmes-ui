export type Paginated<T> = {
  content: Array<T>
  pageIsEmpty: boolean
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
}
