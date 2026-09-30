export type EventCategory = {
  name: string
  /** Optional Bengali category name for bn locale */
  nameBn?: string
  amount?: number
}

export const CUSTOM_FORM_FIELD_TYPES = [
  'shortText',
  'longText',
  'number',
  'email',
  'phone',
  'select',
  'radio',
  'checkbox',
] as const

export type CustomFormFieldType = (typeof CUSTOM_FORM_FIELD_TYPES)[number]

export type EventCustomFormField = {
  id: string
  label: string
  /** Optional Bengali label for bn locale */
  labelBn?: string
  type: CustomFormFieldType
  required: boolean
  placeholder?: string
  /** Optional Bengali placeholder for bn locale */
  placeholderBn?: string
  options?: string[]
  /** Optional Bengali options for bn locale */
  optionsBn?: string[]
}

export type EventDefaultRegistrationFields = {
  name: { enabled: true; required: true }
  email: { enabled: true; required: true }
  phone: { enabled: true; required: true }
  school: { enabled: boolean; required: boolean }
  category: { enabled: boolean; required: boolean }
  information: { enabled: boolean; required: boolean }
}

// Event type extending the existing structure from app/(marketing)/events/data.ts
// with Firestore-specific fields
export type Event = {
  id: string // Firestore document ID
  /** URL slug derived from title. Optional on older docs until lazy-backfilled. */
  slug?: string
  title: string
  /** Optional Bengali title for bn locale */
  titleBn?: string
  date: string | string[] // Single date string or array of dates
  time?: string
  /** Optional Bengali time for bn locale */
  timeBn?: string
  location: string
  /** Optional Bengali location for bn locale */
  locationBn?: string
  description: string
  /** Optional Bengali description for bn locale */
  descriptionBn?: string
  fullDescription?: string
  /** Optional Bengali full description for bn locale */
  fullDescriptionBn?: string
  image?: string
  eligibility?: string
  /** Optional Bengali eligibility for bn locale */
  eligibilityBn?: string
  venue?: string
  /** Optional Bengali venue for bn locale */
  venueBn?: string
  agenda?: string
  /** Optional Bengali agenda for bn locale */
  agendaBn?: string
  tags?: string[] // Event tags for categorization
  /** Optional Bengali tags for bn locale */
  tagsBn?: string[]
  categories?: EventCategory[] // Optional categories (paid events can have per-category fee)
  isPaid?: boolean
  amount?: number // Fee amount (e.g. BDT)
  paymentBkashNumber?: string // bKash number for participants to pay to (set by event creator)
  contactPersonName?: string
  /** Optional Bengali contact person name for bn locale */
  contactPersonNameBn?: string
  contactPersonDesignation?: string
  /** Optional Bengali contact person designation for bn locale */
  contactPersonDesignationBn?: string
  contactPersonMobileOrEmail?: string
  registrationClosingDate?: string // Optional ISO date (YYYY-MM-DD); registration closes at end of this day in Asia/Dhaka (BST)
  registrationDisabled?: boolean // When true, registration is closed regardless of date (Super Admin or event creator can toggle)
  customFormFields?: EventCustomFormField[]
  defaultRegistrationFields?: EventDefaultRegistrationFields
  /** Assigned certificate template from Certificates dashboard. */
  certificateTemplateId?: string | null
  /** Optional card link override (e.g. hardcoded Robofest → /robofest). Defaults to /events/[slug]. */
  href?: string
  // Firestore metadata
  createdAt: Date | string
  updatedAt: Date | string
  createdBy: string // UID of the admin who created it
  createdByName?: string // Name of the admin who created it
  createdByEmail?: string // Email of the admin who created it
}

