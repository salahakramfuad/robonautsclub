/**
 * PDF Storage utility for Cloudinary
 * Stores PDFs in event-organized folder structure: booking-confirmations/events/<event-slug>/booking-<bookingId>.pdf
 */

import cloudinary from './cloudinary'
import { Readable } from 'stream'

/**
 * Convert buffer to stream for Cloudinary upload
 */
function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)
  return stream
}

/**
 * Upload PDF to Cloudinary with event-based folder structure
 * Stores PDFs in: booking-confirmations/events/<event-slug>/booking-<bookingId>.pdf
 * Tries 'raw' resource_type first, falls back to 'image' if needed
 */
export async function uploadPDFToStorage(
  pdfBuffer: Buffer,
  eventTitle: string,
  bookingId: string
): Promise<string | null> {
  try {
    if (!process.env.CLOUDINARY_URL) {
      console.error('Cloudinary is not configured')
      return null
    }

    // Generate event slug for folder structure
    const { generateEventSlug } = require('./pathUtils')
    const eventSlug = generateEventSlug(eventTitle)
    const sanitizedBookingId = bookingId.replace(/[^a-zA-Z0-9]/g, '')
    
    // Create folder path: booking-confirmations/events/<event-slug>
    // File name: booking-<bookingId>.pdf
    const publicId = `booking-confirmations/events/${eventSlug}/booking-${sanitizedBookingId}`

    // Try uploading as 'raw' resource_type first (Option 1)
    const rawResult = await uploadPDFWithResourceType(pdfBuffer, publicId, 'raw')
    if (rawResult) {
      return rawResult
    }

    // Fallback to 'image' resource_type if 'raw' fails (Option 2)
    const imageResult = await uploadPDFWithResourceType(pdfBuffer, publicId, 'image')
    if (imageResult) {
      return imageResult
    }

    return null
  } catch (error) {
    console.error('Error uploading PDF to Cloudinary:', error)
    return null
  }
}

/**
 * Upload PDF with specified resource type
 */
async function uploadPDFWithResourceType(
  pdfBuffer: Buffer,
  publicId: string,
  resourceType: 'raw' | 'image'
): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    try {
      // Convert buffer to stream
      const stream = bufferToStream(pdfBuffer)

      // Upload options with proper access settings
      // publicId already contains the full path: booking-confirmations/events/<event-slug>/booking-<bookingId>
      const uploadOptions: any = {
        resource_type: resourceType,
        public_id: publicId, // Full path including folder structure
        format: 'pdf',
        access_mode: 'public', // Ensure file is publicly accessible
        invalidate: true, // Clear CDN cache
        type: 'upload', // Explicit upload type
        allowed_formats: ['pdf'], // Security: only allow PDF format
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error(`Cloudinary PDF upload error (resource_type: ${resourceType}):`, {
              message: error.message,
              http_code: error.http_code,
              name: error.name,
              error: JSON.stringify(error, null, 2),
            })
            resolve(null)
            return
          }

          if (!result) {
            console.error(`Cloudinary upload succeeded but no result object returned (resource_type: ${resourceType})`)
            resolve(null)
            return
          }

          // Verify URL format - use secure_url for HTTPS
          const url = result.secure_url || result.url
          if (!url) {
            console.error(`Cloudinary upload succeeded but no URL was returned (resource_type: ${resourceType}):`, result)
            resolve(null)
            return
          }

          // Validate URL format
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            resolve(null)
            return
          }

          resolve(url)
        }
      )

      stream.pipe(uploadStream)
    } catch (error) {
      console.error(`Error creating upload stream (resource_type: ${resourceType}):`, error)
      resolve(null)
    }
  })
}

/**
 * Delete PDF from Cloudinary
 * Tries both 'raw' and 'image' resource types since we support both
 * Constructs publicId from eventTitle and bookingId using the same folder structure as upload
 */
export async function deletePDFFromStorage(
  eventTitle: string,
  bookingId: string
): Promise<boolean> {
  try {
    if (!process.env.CLOUDINARY_URL) {
      console.error('Cloudinary is not configured')
      return false
    }

    // Generate event slug for folder structure
    const { generateEventSlug } = require('./pathUtils')
    const eventSlug = generateEventSlug(eventTitle)
    const sanitizedBookingId = bookingId.replace(/[^a-zA-Z0-9]/g, '')
    
    // Construct publicId matching the upload structure
    const publicId = `booking-confirmations/events/${eventSlug}/booking-${sanitizedBookingId}`
    let deleted = false

    // Try deleting as 'raw' first
    try {
      const rawResult = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
      })

      if (rawResult.result === 'ok') {
        deleted = true
      }
    } catch (error) {
      // Try image resource type if raw fails
    }

    // If not deleted yet, try as 'image' resource type
    if (!deleted) {
      try {
        const imageResult = await cloudinary.uploader.destroy(publicId, {
          resource_type: 'image',
        })

        if (imageResult.result === 'ok') {
          deleted = true
        }
      } catch (error) {
        // Silently fail if both methods fail
      }
    }

    return deleted
  } catch (error) {
    console.error('Error deleting PDF from Cloudinary:', error)
    return false
  }
}

