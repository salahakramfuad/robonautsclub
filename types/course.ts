// Course type for Firestore storage
export type Course = {
  id: string // Firestore document ID
  title: string
  /** Optional Bengali title for bn locale */
  titleBn?: string
  level: string // e.g., "Beginner-Intermediate", "For All", "All Levels"
  /** Optional Bengali level for bn locale */
  levelBn?: string
  blurb: string // Short description
  /** Optional Bengali blurb for bn locale */
  blurbBn?: string
  href: string // Course detail page URL
  image: string // Cloudinary URL
  isArchived: boolean // Default: false
  // Firestore metadata
  createdAt: Date | string
  updatedAt: Date | string
  createdBy: string // UID of the admin who created it
  createdByName?: string // Name of the admin who created it
  createdByEmail?: string // Email of the admin who created it
}

