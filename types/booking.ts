// Booking type for Firestore bookings collection
export type Booking = {
  id: string // Firestore document ID
  eventId: string // Reference to event document
  registrationId: string // Unique registration ID (format: REG-YYYYMMDD-XXXXX)
  pdfPath?: string // Local filesystem path to stored PDF confirmation document (e.g., /uploads/events/event-slug/booking-id.pdf)
  pdfUrl?: string // DEPRECATED: Kept for backward compatibility with old bookings stored in Cloudinary
  name: string
  school: string
  email: string
  phone: string
  parentsPhone: string
  information: string
  createdAt: Date | string
}

