export type GalleryImage = {
  url: string
}

export type GalleryGroup = {
  id: string
  title: string
  /** Optional Bengali title for bn locale */
  titleBn?: string
  location: string
  /** Optional Bengali location for bn locale */
  locationBn?: string
  images: GalleryImage[]
  /** Total images in album; may exceed `images.length` on lean listing payloads. */
  imageCount?: number
  sortOrder: number
  /** Manual display date; falls back to createdAt in UI when absent */
  displayDate?: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  createdBy: string
}
