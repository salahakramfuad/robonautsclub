import type {
  RobofestRegistration,
  RobofestRegistrationStatus,
} from '@/lib/robofest-content'

export type RobofestRegistrationListFilters = {
  status: RobofestRegistrationStatus
  category?: string
  roundCity?: string
  ageCategory?: string
  /** Global substring search across team / member / contact fields. */
  search?: string
}

export type RobofestRegistrationCursor = {
  createdAt: string
  id: string
}

export type RobofestRegistrationPage = {
  items: RobofestRegistration[]
  nextCursor: RobofestRegistrationCursor | null
  hasMore: boolean
  /** Total rows matching filters (incl. search) when known; used for pager. */
  matchedTotal?: number | null
}

export type RobofestRegistrationStatusCounts = {
  pending: number
  confirmed: number
  cancelled: number
}
