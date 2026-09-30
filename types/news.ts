export type NewsArticle = {
  id: string
  title: string
  /** Optional Bengali title for bn locale */
  titleBn?: string
  slug: string
  body: string
  /** Optional Bengali body for bn locale */
  bodyBn?: string
  coverImageUrl?: string
  images?: string[]
  published: boolean
  /** Manual editorial date; falls back to publishedAt/createdAt in UI when absent */
  displayDate?: Date | string | null
  publishedAt: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  createdBy: string
}
