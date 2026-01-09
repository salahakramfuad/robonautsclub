/**
 * PDF Storage utility for Cloudinary and Local Filesystem
 */

import cloudinary from './cloudinary'
import { Readable } from 'stream'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { getAbsolutePDFPath, getAbsoluteEventDirectoryPath, generateEventSlug } from './pathUtils'

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
 * Upload PDF to Cloudinary and return the download URL
 * Tries 'raw' resource_type first, falls back to 'image' if needed
 */
export async function uploadPDFToStorage(
  pdfBuffer: Buffer,
  registrationId: string
): Promise<string | null> {
  try {
    if (!process.env.CLOUDINARY_URL) {
      console.error('Cloudinary is not configured')
      return null
    }

    // Try uploading as 'raw' resource_type first (Option 1)
    const rawResult = await uploadPDFWithResourceType(pdfBuffer, registrationId, 'raw')
    if (rawResult) {
      return rawResult
    }

    // Fallback to 'image' resource_type if 'raw' fails (Option 2)
    const imageResult = await uploadPDFWithResourceType(pdfBuffer, registrationId, 'image')
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
  registrationId: string,
  resourceType: 'raw' | 'image'
): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    try {
      // Convert buffer to stream
      const stream = bufferToStream(pdfBuffer)

      // Upload options with proper access settings
      const uploadOptions: any = {
        folder: 'booking-confirmations', // Organize PDFs in a folder
        resource_type: resourceType,
        public_id: registrationId, // Use registrationId as the public_id
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
 * Save PDF to local filesystem in event-organized structure
 * Creates directory structure automatically: /uploads/events/<event-slug>/booking-<bookingId>.pdf
 * 
 * @param pdfBuffer - The PDF file buffer to save
 * @param eventTitle - The event title (will be converted to slug)
 * @param bookingId - The booking document ID
 * @returns The relative path to the saved PDF, or null if save failed
 */
export async function savePDFToLocalFilesystem(
  pdfBuffer: Buffer,
  eventTitle: string,
  bookingId: string
): Promise<string | null> {
  try {
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      console.error('Invalid PDF buffer provided')
      return null
    }

    if (!eventTitle || typeof eventTitle !== 'string' || eventTitle.trim() === '') {
      console.error('Invalid event title provided')
      return null
    }

    if (!bookingId || typeof bookingId !== 'string' || bookingId.trim() === '') {
      console.error('Invalid bookingId provided')
      return null
    }

    // Generate event slug and get paths
    const eventSlug = generateEventSlug(eventTitle)
    const absoluteDirPath = getAbsoluteEventDirectoryPath(eventSlug)
    const absoluteFilePath = getAbsolutePDFPath(eventSlug, bookingId)

    // Create directory if it doesn't exist (recursive)
    try {
      if (!existsSync(absoluteDirPath)) {
        mkdirSync(absoluteDirPath, { recursive: true })
      }
    } catch (error: any) {
      console.error('Error creating directory for PDF storage:', error)
      return null
    }

    // Write PDF buffer to file
    try {
      writeFileSync(absoluteFilePath, pdfBuffer, 'binary')
      
      // Return relative path (starts with /)
      const relativePath = `/uploads/events/${eventSlug}/booking-${bookingId.replace(/[^a-zA-Z0-9]/g, '')}.pdf`
      return relativePath
    } catch (error: any) {
      console.error('Error writing PDF file to filesystem:', error)
      return null
    }
  } catch (error) {
    console.error('Error saving PDF to local filesystem:', error)
    return null
  }
}

/**
 * Delete PDF from Cloudinary
 * Tries both 'raw' and 'image' resource types since we support both
 */
export async function deletePDFFromStorage(registrationId: string): Promise<boolean> {
  try {
    if (!process.env.CLOUDINARY_URL) {
      console.error('Cloudinary is not configured')
      return false
    }

    const publicId = `booking-confirmations/${registrationId}`
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

